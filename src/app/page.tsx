"use client";

import { useState } from "react";

export default function Home() {
  const [groupId, setGroupId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [responseMsg, setResponseMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setResponseMsg("");

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId, message }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setResponseMsg("Message sent successfully!");
        setMessage(""); // Clear message, keep group ID
      } else {
        setStatus("error");
        setResponseMsg(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setResponseMsg("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] flex flex-col items-center justify-center bg-gray-50 text-gray-900">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Line Blasting</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div>
            <label htmlFor="groupId" className="block text-sm font-medium mb-1">
              Group ID
            </label>
            <input
              type="text"
              id="groupId"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Cxxxxxxxx..."
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your message here"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {status === "loading" ? "Sending..." : "Send Message"}
          </button>
        </form>

        {status === "success" && (
          <div className="p-4 bg-green-100 text-green-700 rounded w-full border border-green-200">
            {responseMsg}
          </div>
        )}

        {status === "error" && (
          <div className="p-4 bg-red-100 text-red-700 rounded w-full border border-red-200">
            {responseMsg}
          </div>
        )}
      </main>
    </div>
  );
}
