"use client";

import { useState, useEffect } from "react";
import { Send, Calendar, Clock, Repeat, Users, MessageSquare, Loader2, CheckCircle, AlertCircle, History } from "lucide-react";
import { format } from "date-fns";

type Schedule = {
  id: string;
  targetId: string;
  message: string;
  scheduledAt: string;
  recurrence: string;
  active: boolean;
  createdAt: string;
};

export default function Home() {
  const [targetId, setTargetId] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [recurrence, setRecurrence] = useState("ONCE");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch schedules on mount
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/schedules");
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules || []);
      }
    } catch (error) {
      console.error("Failed to fetch schedules", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const payload = {
        targetId,
        message,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
        recurrence,
      };

      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setFeedback("Schedule created successfully!");
        setTargetId("");
        setMessage("");
        setScheduledAt("");
        fetchSchedules(); // Refresh list
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setFeedback(data.error || "Failed to create schedule");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setFeedback("An unexpected error occurred.");
    }
  };

  const handleSendNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!targetId || !message) {
      setFeedback("Target ID and Message are required.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setFeedback("");

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: targetId, message }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setFeedback("Message sent immediately!");
        setMessage("");
        fetchSchedules(); // Refresh list to show history
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setFeedback(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setFeedback("An unexpected error occurred.");
    }
  };

  const handleRunCron = async (e: React.MouseEvent) => {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const res = await fetch("/api/cron");
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setFeedback(`Scheduler ran! Processed ${data.processed} items.`);
        fetchSchedules();
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setFeedback("Failed to run scheduler");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setFeedback("Scheduler error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* LEFT COLUMN: FORM */}
        <section className="flex flex-col gap-6">
          <header>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <span className="bg-blue-600 text-white p-2 rounded-lg"><Send size={24} /></span>
              Line Blaster
            </h1>
            <p className="text-slate-500 mt-2">Schedule your broadcasts easily.</p>
          </header>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <Calendar size={20} /> New Schedule
              </h2>
            </div>

            <form className="p-6 flex flex-col gap-5">

              {/* Target ID */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Users size={16} /> Target ID (Group/User)
                </label>
                <input
                  type="text"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="Cxxxxxxxx..."
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400 font-mono text-sm"
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MessageSquare size={16} /> Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your broadcast message..."
                  required
                  rows={4}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Clock size={16} /> Schedule Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Repeat size={16} /> Recurrence
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  >
                    <option value="ONCE">Once</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {status === "loading" ? <Loader2 className="animate-spin" /> : <><Calendar size={18} /> Schedule</>}
                </button>

                <button
                  onClick={handleSendNow}
                  disabled={status === "loading"}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  {status === "loading" ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Now</>}
                </button>
              </div>

              <button
                onClick={handleRunCron}
                disabled={status === "loading"}
                className="w-full mt-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
              >
                <Clock size={16} /> Force Run Scheduler (Dev Mode)
              </button>

              {/* Feedback */}
              {status === "success" && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 border border-green-100">
                  <CheckCircle size={16} /> {feedback}
                </div>
              )}
              {status === "error" && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                  <AlertCircle size={16} /> {feedback}
                </div>
              )}
            </form>
          </div>
        </section>

        {/* RIGHT COLUMN: HISTORY */}
        <section className="flex flex-col gap-6">
          <header className="md:mt-0 mt-8">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <History size={24} className="text-indigo-600" /> History & Schedules
            </h2>
            <p className="text-slate-500 text-sm">Active schedules and sent messages.</p>
          </header>

          <div className="flex-1 overflow-auto space-y-4 max-h-[600px] pr-2">
            {loadingData ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-400">No schedules found.</p>
              </div>
            ) : (
              schedules.map((item) => (
                <div key={item.id} className={`group relative p-5 bg-white rounded-xl border transition-all hover:shadow-md ${item.active ? 'border-l-4 border-l-blue-500 border-slate-200' : 'border-l-4 border-l-slate-300 border-slate-100 opacity-75'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded-full ${item.active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.active ? item.recurrence : 'SENT'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {format(new Date(item.scheduledAt), "MMM d, HH:mm")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 line-clamp-1 mb-1" title={item.targetId}>Target: {item.targetId}</h3>
                  <p className="text-slate-600 text-sm line-clamp-2">{item.message}</p>

                  {!item.active && (
                    <div className="absolute top-4 right-4 text-green-500">
                      <CheckCircle size={20} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
