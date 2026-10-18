"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { CareerMessage } from "@/lib/career-chat";
import styles from "./career-chat.module.css";

const suggestions = ["What is Ahmad’s backend experience?", "Tell me about his recent work.", "How can I contact Ahmad?"];

function AnswerText({ content }: { content: string }) {
  // Render only simple emphasis; all other model output stays escaped text.
  return <>{content.split(/(\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part)}</>;
}

export function CareerChat() {
  const [messages, setMessages] = useState<CareerMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const conversation = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    if (conversation.current) conversation.current.scrollTop = conversation.current.scrollHeight;
  }, [messages, pending, error]);
  useEffect(() => () => controller.current?.abort(), []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy.current) return;
    busy.current = true;
    setError("");
    setQuestion("");
    setPending(true);
    // Keep complete user/assistant pairs so history always begins with a user.
    const history = [...messages.slice(-10), { role: "user" as const, content }];
    setMessages(history);
    const abort = new AbortController();
    controller.current = abort;
    try {
      const response = await fetch("/api/career-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.signal,
        body: JSON.stringify({ messages: history }),
      });
      const data = await response.json();
      if (!response.ok || typeof data.answer !== "string") throw new Error(data.error || "Chat could not respond. Please try again.");
      setMessages([...history, { role: "assistant", content: data.answer }]);
    } catch (cause) {
      if (!abort.signal.aborted) {
        setError(cause instanceof Error && cause.message !== "Failed to fetch" ? cause.message : "Could not connect. Please try again.");
        setMessages(messages);
        setQuestion(content);
      }
    } finally {
      busy.current = false;
      setPending(false);
      controller.current = null;
      requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void send(question); }
  function clear() { if (!pending) { setMessages([]); setError(""); setQuestion(""); input.current?.focus({ preventScroll: true }); } }

  return (
    <section id="digital-twin" aria-labelledby="career-chat-title" className={`shell section ${styles.widget}`}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>05 / A CONVERSATION ABOUT MY CAREER</span>
          <h2 id="career-chat-title">Digital Twin</h2>
          <p>Explore my career, engineering work, and approach to building software.</p>
        </header>
        <div className={styles.panel}>
        <p className={styles.notice}>An AI guide to Ahmad’s professional experience. Answers may be imperfect. Messages are sent to OpenRouter and its model provider.</p>
        <div ref={conversation} className={styles.conversation} role="log" aria-label="Career conversation" aria-live="polite" aria-relevant="additions text" aria-busy={pending}>
          {messages.length === 0 && !pending && <div className={styles.welcome}><p>Hi! Ask me about Ahmad’s experience, skills, or engineering work.</p><div className={styles.suggestions}>{suggestions.map(text => <button type="button" key={text} onClick={() => void send(text)}>{text} <span aria-hidden="true">↗</span></button>)}</div></div>}
          {messages.map((message, index) => <div className={message.role === "user" ? styles.userMessage : styles.assistantMessage} key={`${index}-${message.role}`}><span>{message.role === "user" ? "You" : "AI career guide"}</span><p><AnswerText content={message.content} /></p></div>)}
          {pending && <p className={styles.thinking} role="status">Thinking about your question…</p>}
          {error && <p className={styles.error} role="alert">{error}</p>}
        </div>
        <form className={styles.form} onSubmit={submit}>
          <label htmlFor="career-chat-question">Your question</label>
          <textarea id="career-chat-question" ref={input} value={question} onChange={event => setQuestion(event.target.value)} maxLength={2000} rows={2} placeholder="Ask about experience, skills, or projects…" disabled={pending} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (question.trim()) void send(question); } }} />
          <div className={styles.formActions}><button type="button" className={styles.reset} onClick={clear} disabled={pending || (!messages.length && !error)}>New chat</button><button className={styles.send} type="submit" disabled={pending || !question.trim()}>{pending ? "Thinking…" : "Send question →"}</button></div>
          <p className={styles.footnote}>Chat is not saved by this website.</p>
        </form>
        </div>
    </section>
  );
}
