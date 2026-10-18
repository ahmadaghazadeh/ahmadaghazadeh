import type { Metadata } from "next";
import { connection } from "next/server";
import { adminConfigured, isAdmin, MIN_PASSWORD_LENGTH } from "@/lib/admin-session";
import { getDashboard, type Conversation } from "@/lib/analytics-store";
import { logout } from "./actions";
import { LoginForm } from "./login-form";
import styles from "./admin.module.css";

export const metadata: Metadata = { title: "Private dashboard", robots: { index: false, follow: false } };

const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
const formatTime = (time: number) => (time ? `${dateTime.format(time)} UTC` : "Unknown time");

function ConversationItem({ conversation }: { conversation: Conversation }) {
  const first = conversation.turns[0]?.question ?? "(no questions recorded)";
  return (
    <details className={styles.chat}>
      <summary>
        <span className={styles.chatTitle}>{first}</span>
        <span className={styles.chatMeta}>
          {formatTime(conversation.updatedAt)} · {conversation.turns.length} {conversation.turns.length === 1 ? "question" : "questions"}
          {conversation.country && ` · ${conversation.country}`}
        </span>
      </summary>
      <ol className={styles.turns}>
        {conversation.turns.map((turn, index) => (
          <li key={index}>
            <p className={styles.question}><span>Visitor · {formatTime(turn.at)}</span>{turn.question}</p>
            {turn.answer
              ? <p className={styles.answer}><span>AI career guide</span>{turn.answer}</p>
              : <p className={styles.failed}><span>Not answered</span>{turn.error}</p>}
          </li>
        ))}
      </ol>
    </details>
  );
}

export default async function AdminPage() {
  await connection();
  if (!adminConfigured()) {
    return <main className={styles.page}><p className={styles.notice}>Set <code>ADMIN_PASSWORD</code> (at least {MIN_PASSWORD_LENGTH} characters) in the server environment to enable this page.</p></main>;
  }
  if (!(await isAdmin())) return <main className={styles.page}><LoginForm /></main>;

  const data = await getDashboard();
  const busiestDay = Math.max(1, ...(data?.daily.map(day => day.visits) ?? []));

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Private dashboard</h1>
        <form action={logout}><button className={styles.secondary} type="submit">Log out</button></form>
      </header>

      {!data ? (
        <p className={styles.notice}>Storage is not connected. Add an Upstash Redis database to this Vercel project, then redeploy.</p>
      ) : (
        <>
          <section className={styles.stats} aria-label="Totals">
            {[
              { label: "Visits", value: data.visits, hint: "Once per browser session" },
              { label: "Unique visitors", value: data.visitors, hint: "Approximate, per browser" },
              { label: "Conversations", value: data.conversations, hint: "Chat sessions started" },
              { label: "Questions", value: data.questions, hint: "Messages sent to the chat" },
            ].map(stat => (
              <div key={stat.label}><span>{stat.label}</span><strong>{stat.value.toLocaleString("en")}</strong><small>{stat.hint}</small></div>
            ))}
          </section>

          <section className={styles.section} aria-labelledby="daily-title">
            <h2 id="daily-title">Visits in the last 14 days (UTC)</h2>
            <ol className={styles.daily}>
              {data.daily.map(day => (
                <li key={day.day}>
                  <span>{day.day.slice(5)}</span>
                  <span className={styles.track}><span className={styles.bar} style={{ width: `${(day.visits / busiestDay) * 100}%` }} /></span>
                  <strong>{day.visits}</strong>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.section} aria-labelledby="chats-title">
            <h2 id="chats-title">Recent conversations</h2>
            {data.recent.length === 0
              ? <p className={styles.empty}>No conversations yet.</p>
              : data.recent.map(conversation => <ConversationItem key={conversation.id} conversation={conversation} />)}
            {data.conversations > data.recent.length && <p className={styles.empty}>Showing the latest {data.recent.length} of {data.conversations}.</p>}
          </section>
        </>
      )}
    </main>
  );
}
