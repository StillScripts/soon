"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "backend/convex";
import { FormEvent, useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const things = useQuery(api.things.getThings);
  const createThing = useMutation(api.things.createThing);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await createThing({ title: title.trim() });
      setTitle("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Things Manager</h1>

        <div style={{ marginBottom: "2rem", width: "100%", maxWidth: "500px" }}>
          <h2>Create a Thing</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter thing title..."
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: "0.5rem",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "none",
                backgroundColor: isSubmitting ? "#ccc" : "#0070f3",
                color: "white",
                cursor: isSubmitting || !title.trim() ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </form>
        </div>

        <div style={{ width: "100%", maxWidth: "500px" }}>
          <h2>All Things</h2>
          {things === undefined ? (
            <p>Loading...</p>
          ) : things.length === 0 ? (
            <p style={{ color: "#666" }}>No things yet. Create one above!</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {things.map((thing) => (
                <li
                  key={thing._id}
                  style={{
                    padding: "1rem",
                    marginBottom: "0.5rem",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{thing.title}</span>
                  <span style={{ fontSize: "0.75rem", color: "#666" }}>
                    {new Date(thing._creationTime).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
