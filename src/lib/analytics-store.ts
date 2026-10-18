import "server-only";
import { Redis } from "@upstash/redis";
import type { CareerExchange } from "@/lib/career-chat";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token, enableAutoPipelining: true }) : null;

const DAY_MS = 86_400_000;
const MAX_LOGIN_FAILURES = 5;
const LOGIN_LOCK_SECONDS = 15 * 60;

export type StoredTurn = { at: number; question: string; answer?: string; error?: string };
export type Conversation = { id: string; createdAt: number; updatedAt: number; country?: string; turns: StoredTurn[] };
export type Dashboard = {
  visits: number;
  visitors: number;
  questions: number;
  conversations: number;
  daily: { day: string; visits: number }[];
  recent: Conversation[];
};

const dayKey = (time: number) => new Date(time).toISOString().slice(0, 10);

export async function recordVisit(visitorId: string) {
  if (!redis) return;
  await redis.pipeline()
    .incr("stats:visits")
    .incr(`stats:visits:${dayKey(Date.now())}`)
    .pfadd("stats:visitors", visitorId)
    .exec();
}

export async function recordExchange({ conversationId, question, answer, error }: CareerExchange, country?: string) {
  if (!redis) return;
  const now = Date.now();
  const key = `chat:${conversationId}`;
  const turn: StoredTurn = answer ? { at: now, question, answer } : { at: now, question, error };
  await redis.pipeline()
    .hsetnx(key, "createdAt", now)
    .hset(key, country ? { updatedAt: now, country } : { updatedAt: now })
    .rpush(`${key}:turns`, turn)
    .zadd("chats", { score: now, member: conversationId })
    .incr("stats:questions")
    .exec();
}

export async function getDashboard(limit = 50): Promise<Dashboard | null> {
  if (!redis) return null;
  const now = Date.now();
  const days = Array.from({ length: 14 }, (_, index) => dayKey(now - (13 - index) * DAY_MS));
  const [visits, visitors, questions, conversations, ids, daily] = await Promise.all([
    redis.get<number>("stats:visits"),
    redis.pfcount("stats:visitors"),
    redis.get<number>("stats:questions"),
    redis.zcard("chats"),
    redis.zrange<string[]>("chats", 0, limit - 1, { rev: true }),
    redis.mget<(number | null)[]>(...days.map(day => `stats:visits:${day}`)),
  ]);
  const recent = await Promise.all(ids.map(async id => {
    const [meta, turns] = await Promise.all([
      redis.hgetall<{ createdAt?: number; updatedAt?: number; country?: string }>(`chat:${id}`),
      redis.lrange<StoredTurn>(`chat:${id}:turns`, 0, -1),
    ]);
    return { id: String(id), createdAt: Number(meta?.createdAt ?? 0), updatedAt: Number(meta?.updatedAt ?? 0), country: meta?.country, turns };
  }));
  return {
    visits: visits ?? 0,
    visitors,
    questions: questions ?? 0,
    conversations,
    daily: days.map((day, index) => ({ day, visits: Number(daily[index] ?? 0) })),
    recent,
  };
}

export async function tooManyFailedLogins(ip: string) {
  if (!redis) return false;
  return ((await redis.get<number>(`login:fail:${ip}`)) ?? 0) >= MAX_LOGIN_FAILURES;
}

export async function registerFailedLogin(ip: string) {
  if (!redis) return;
  const key = `login:fail:${ip}`;
  await redis.pipeline().incr(key).expire(key, LOGIN_LOCK_SECONDS).exec();
}
