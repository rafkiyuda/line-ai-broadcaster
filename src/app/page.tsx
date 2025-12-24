"use client";

import { useState, useEffect } from "react";
import { Send, Calendar, Clock, Repeat, Users, MessageSquare, Loader2, CheckCircle, AlertCircle, History, Sparkles, Zap, X } from "lucide-react";
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
  const [tone, setTone] = useState("Professional");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
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

  const handleParaphrase = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!message) {
      setFeedback("Please type a message first to paraphrase.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
      return;
    }

    setIsAiLoading(true);
    setFeedback("");

    try {
      const res = await fetch("/api/paraphrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message, tone }),
      });

      const data = await res.json();

      if (res.ok && data.paraphrased) {
        setAiSuggestion(data.paraphrased);
        setFeedback("AI suggestion ready below! 👇");
        setStatus("success");
      } else {
        setFeedback("Failed to paraphrase.");
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setFeedback("AI Service Error");
      setStatus("error");
    } finally {
      setIsAiLoading(false);
      setTimeout(() => setStatus("idle"), 3000);
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

  const handleApplyAi = () => {
    setMessage(aiSuggestion);
    setShowAiModal(false);
    setFeedback("AI suggestion applied! ✨");
  };

  return (
    <div className="min-h-screen relative bg-slate-50 text-slate-800 font-sans p-6 md:p-12 overflow-hidden selection:bg-teal-200">

      {/* BACKGROUND BLOBS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-300/30 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-300/30 rounded-full blur-[100px] animate-pulse delay-1000" />
      <div className="absolute top-[40%] left-[80%] w-[20%] h-[20%] bg-indigo-300/20 rounded-full blur-[80px]" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

        {/* LEFT COLUMN: FORM (7/12 width on large screens) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <header className="mb-2">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-400 blur-lg opacity-40 rounded-full"></div>
                <span className="relative bg-gradient-to-br from-teal-500 to-cyan-600 text-white p-3 rounded-2xl shadow-xl shadow-teal-200/50"><Zap size={28} fill="currentColor" /></span>
              </div>
              <span>Line<span className="text-teal-600">Blaster</span></span>
            </h1>
            <p className="text-slate-500 mt-3 font-medium text-lg ml-1">Broadcast messages with precision & style.</p>
          </header>

          <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/60 overflow-hidden ring-1 ring-white/60 transition-all">
            <div className="p-8 bg-gradient-to-br from-white/50 to-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10" />
              <h2 className="relative z-10 text-teal-900 font-bold text-xl flex items-center gap-3">
                <span className="bg-white/80 p-2 rounded-lg shadow-sm text-teal-600"><Calendar size={20} /></span>
                New Broadcast
              </h2>
            </div>

            <form className="p-8 pt-6 flex flex-col gap-7">

              {/* Target ID */}
              <div className="group">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-2 group-focus-within:text-teal-600 transition-colors ml-1">
                  Target ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    placeholder="Cxxxxxxxx..."
                    required
                    className="w-full pl-5 pr-4 py-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 font-mono text-sm shadow-sm backdrop-blur-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors">
                    <Users size={18} />
                  </div>
                </div>
              </div>

              {/* Message with AI Controls */}
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 group-focus-within:text-teal-600 transition-colors ml-1">
                    Message Content
                  </label>
                  <div className="flex gap-2 items-center">
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="bg-slate-100 border-none text-xs rounded-lg px-2 py-1 text-slate-600 focus:ring-2 focus:ring-teal-400 cursor-pointer outline-none"
                      disabled={isAiLoading}
                    >
                      <option value="Professional">Professional</option>
                      <option value="Fun">Fun & Casual</option>
                      <option value="Marketing">Marketing / Hype</option>
                      <option value="Empathetic">Empathetic</option>
                    </select>
                    <button
                      onClick={handleParaphrase}
                      disabled={isAiLoading || !message}
                      className="text-xs flex items-center gap-1 bg-gradient-to-r from-teal-400 to-cyan-500 text-white px-2 py-1 rounded-lg hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                      title="Rewrite with Gemini AI"
                    >
                      {isAiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      Rewrite
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your broadcast message here..."
                    required
                    rows={4}
                    className="w-full pl-5 pr-4 py-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 shadow-sm resize-none backdrop-blur-sm"
                  />
                  <div className="absolute right-4 top-4 text-slate-300 group-focus-within:text-teal-500 transition-colors">
                    <MessageSquare size={18} />
                  </div>
                </div>
              </div>

              {/* AI Result Area (Split View) */}
              {aiSuggestion && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-teal-600 flex items-center gap-2 ml-1">
                      <Sparkles size={14} /> AI Suggestion
                    </label>
                    <button
                      type="button"
                      onClick={handleApplyAi}
                      className="text-xs font-bold bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full hover:bg-teal-200 transition-colors flex items-center gap-1.5"
                    >
                      <Zap size={12} fill="currentColor" /> Use This
                    </button>
                  </div>
                  <textarea
                    value={aiSuggestion}
                    readOnly
                    rows={4}
                    className="w-full pl-5 pr-4 py-4 bg-teal-50/50 border border-teal-200/60 rounded-2xl text-slate-600 focus:outline-none transition-all shadow-inner resize-none select-all"
                  />
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="group">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-2 group-focus-within:text-teal-600 transition-colors ml-1">
                    Schedule
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full pl-5 pr-4 py-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 focus:bg-white focus:outline-none text-sm shadow-sm text-slate-600 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-2 group-focus-within:text-teal-600 transition-colors ml-1">
                    Recurrence
                  </label>
                  <div className="relative">
                    <select
                      value={recurrence}
                      onChange={(e) => setRecurrence(e.target.value)}
                      className="w-full pl-5 pr-10 py-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 focus:bg-white focus:outline-none text-sm shadow-sm appearance-none backdrop-blur-sm"
                    >
                      <option value="ONCE">Once</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Repeat size={18} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <button
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                  className="group relative bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-teal-500/20 transition-all active:scale-[0.98] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  <span className="flex items-center justify-center gap-2 text-lg">
                    {status === "loading" ? <Loader2 className="animate-spin" /> : <><Calendar size={20} /> Schedule</>}
                  </span>
                </button>

                <button
                  onClick={handleSendNow}
                  disabled={status === "loading"}
                  className="bg-white hover:bg-slate-50 text-teal-600 font-bold py-4 px-6 rounded-2xl shadow-xl shadow-slate-200/50 transition-all flex items-center justify-center gap-2 active:scale-[0.98] border border-slate-100"
                >
                  {status === "loading" ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Send Now</>}
                </button>
              </div>

              <button
                onClick={handleRunCron}
                disabled={status === "loading"}
                className="w-full mt-2 text-slate-400 hover:text-teal-600 font-medium py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 group"
              >
                <Clock size={14} className="group-hover:animate-spin" /> Force Trigger Scheduler (Dev Only)
              </button>

              {/* Feedback */}
              {status === "success" && (
                <div className="p-4 bg-teal-50/80 backdrop-blur-sm text-teal-800 text-sm font-medium rounded-2xl flex items-center gap-3 border border-teal-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <span className="bg-teal-100 p-1.5 rounded-full"><CheckCircle size={18} className="text-teal-600" /></span> {feedback}
                </div>
              )}
              {status === "error" && (
                <div className="p-4 bg-red-50/80 backdrop-blur-sm text-red-800 text-sm font-medium rounded-2xl flex items-center gap-3 border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <span className="bg-red-100 p-1.5 rounded-full"><AlertCircle size={18} className="text-red-600" /></span> {feedback}
                </div>
              )}
            </form>
          </div>
        </section>

        {/* RIGHT COLUMN: LISTS (5/12 width) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <header className="md:mt-0 mt-8 mb-2 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <span className="bg-white p-2 rounded-xl shadow-sm text-teal-500"><History size={24} /></span>
              Activity
            </h2>
          </header>

          {/* TABS */}
          <div className="bg-slate-200/50 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === "upcoming" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:bg-slate-200/50"}`}
            >
              <Calendar size={14} /> Upcoming
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === "history" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:bg-slate-200/50"}`}
            >
              <History size={14} /> History
            </button>
          </div>

          <div className="flex-1 overflow-auto space-y-4 max-h-[800px] pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pb-10">
            {loadingData ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400/50 gap-4">
                <Loader2 className="animate-spin" size={40} />
                <p className="text-sm font-medium">Loading...</p>
              </div>
            ) : (
              <>
                {activeTab === "upcoming" && (
                  schedules.filter(s => s.active).length === 0 ? (
                    <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-slate-200">
                      <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-300 shadow-sm">
                        <Calendar size={24} />
                      </div>
                      <p className="text-slate-400 text-sm font-medium">No active schedules.</p>
                    </div>
                  ) : (
                    schedules.filter(s => s.active).map((item) => (
                      <div key={item.id} className="group relative p-5 bg-white rounded-2xl border border-teal-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.01]">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded-md bg-teal-50 text-teal-600 border border-teal-100">
                            {item.recurrence}
                          </span>
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Clock size={12} /> {format(new Date(item.scheduledAt), "MMM d, HH:mm")}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-800 line-clamp-1 mb-1 text-sm flex items-center gap-2">
                          <Users size={14} className="text-teal-500" /> {item.targetId}
                        </h3>
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {item.message}
                        </p>
                      </div>
                    ))
                  )
                )}

                {activeTab === "history" && (
                  schedules.filter(s => !s.active).length === 0 ? (
                    <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-slate-200">
                      <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                        <History size={24} />
                      </div>
                      <p className="text-slate-400 text-sm font-medium">No history yet.</p>
                    </div>
                  ) : (
                    schedules.filter(s => !s.active).map((item) => (
                      <div key={item.id} className="relative p-5 bg-slate-50/50 rounded-2xl border border-slate-200/60 opacity-80 hover:opacity-100 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded-md bg-slate-200 text-slate-500">
                            SENT
                          </span>
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            {format(new Date(item.scheduledAt), "MMM d, HH:mm")}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-700 line-clamp-1 mb-1 text-sm flex items-center gap-2">
                          <Users size={14} className="text-slate-400" /> {item.targetId}
                        </h3>
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed italic">
                          {item.message}
                        </p>
                        <div className="absolute top-4 right-4 text-teal-500">
                          <CheckCircle size={16} />
                        </div>
                      </div>
                    ))
                  )
                )}
              </>
            )}
          </div>
        </section>
      </div>



    </div>
  );
}
