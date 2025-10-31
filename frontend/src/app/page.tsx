'use client';

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type MentorResponse = {
  reply: string;
  next_steps: string[];
};

const DEFAULT_API_BASE_URL = "http://localhost:8000";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedSteps, setSuggestedSteps] = useState<string[]>([]);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      return;
    }

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmedInput },
    ];

    setMessages(newMessages);
    setInput("");
    setSuggestedSteps([]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/mentor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: MentorResponse = await response.json();
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply },
      ]);
      setSuggestedSteps(data.next_steps ?? []);
    } catch (apiError) {
      console.error(apiError);
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Something went wrong. Please try again.",
      );
      setMessages((current) => current.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Mentor Bot Prototype</h1>
        <p>
          Share a tough situation and the mentor bot will suggest guidance and
          next steps.
        </p>
      </header>

      <main className={styles.main}>
        <div className={styles.chat}>
          {messages.length === 0 ? (
            <div className={styles.placeholder}>
              <p>
                Try asking for help with a tricky stakeholder conversation or a
                technical concept you need to understand.
              </p>
            </div>
          ) : (
            <ul className={styles.messages}>
              {messages.map((message, index) => (
                <li
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "user" ? styles.userMessage : styles.assistantMessage
                  }
                >
                  <span className={styles.messageBadge}>
                    {message.role === "user" ? "You" : "Mentor"}
                  </span>
                  <p>{message.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className={styles.sidebar}>
          <h2>Next steps</h2>
          {isLoading ? (
            <p className={styles.subtleText}>Thinking...</p>
          ) : suggestedSteps.length > 0 ? (
            <ol>
              {suggestedSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          ) : (
            <p className={styles.subtleText}>
              The mentor will populate actionable follow-ups here.
            </p>
          )}
        </aside>
      </main>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="message" className={styles.label}>
          Describe what you&apos;re facing
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="E.g. I need to align engineering and design on timeline expectations..."
          disabled={isLoading}
        />
        <div className={styles.formActions}>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Ask for guidance"}
          </button>
          {error ? <span className={styles.errorText}>{error}</span> : null}
        </div>
      </form>
    </div>
  );
}
