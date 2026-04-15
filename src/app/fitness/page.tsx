"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Dumbbell,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Heart,
  Star,
} from "lucide-react";

type StageColor = "yellow" | "pink" | "green" | "blue" | "purple" | "orange";

interface Session {
  day: string;
  type: string;
  description: string;
  distance: string;
  targetPace: string;
  warmup?: string;
  mainSet?: string;
  cooldown?: string;
  notes?: string;
  // Logged data
  actualDistance?: string;
  actualPace?: string;
  duration?: string;
  feeling?: number;
  logNotes?: string;
  isLogged?: boolean;
}

interface WeekPlan {
  weekNumber: number;
  sessions: Session[];
}

interface TrainingStage {
  name: string;
  weeks: string;
  description: string;
  color: StageColor;
  weeklyMileage: string;
  weekPlans: WeekPlan[];
}

interface FitnessPlan {
  overview: string;
  targetPace: string;
  totalWeeks: number;
  stages: TrainingStage[];
  tips: string[];
}

const STAGE_COLORS: Record<StageColor, { bg: string; light: string }> = {
  yellow: { bg: "#F2E94E", light: "#FFFDE7" },
  pink: { bg: "#FFB3D1", light: "#FFF0F6" },
  green: { bg: "#B8E8C8", light: "#F0FFF4" },
  blue: { bg: "#B3D9F5", light: "#EFF8FF" },
  purple: { bg: "#DDB3F5", light: "#F9F0FF" },
  orange: { bg: "#FFD4B3", light: "#FFF8F0" },
};

const SESSION_TYPES = [
  "Easy Run", "Tempo Run", "Interval Training", "Long Run",
  "Recovery Run", "Hill Training", "Fartlek", "Rest / Cross-training",
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const FEELING_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Terrible", color: "#FF4444" },
  2: { label: "Hard", color: "#FF8800" },
  3: { label: "OK", color: "#F2E94E" },
  4: { label: "Good", color: "#B8E8C8" },
  5: { label: "Great!", color: "#00CC66" },
};

export default function FitnessPage() {
  const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set(["0"]));
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set(["0-0"]));
  const [loggingSession, setLoggingSession] = useState<{ stageIdx: number; weekIdx: number; sessionIdx: number } | null>(null);
  const [logForm, setLogForm] = useState({ actualDistance: "", actualPace: "", duration: "", feeling: 3, logNotes: "" });

  const [form, setForm] = useState({
    goal: "",
    event: "",
    eventDate: "",
    currentPace: "",
    trainingDays: [] as string[],
  });

  async function handleGenerate() {
    if (!form.goal || !form.event || !form.eventDate || !form.currentPace || form.trainingDays.length === 0) return;
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/ai/fitness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          ...form,
          currentDate: format(new Date(), "yyyy-MM-dd"),
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPlan(data.plan);
      setShowSetup(false);
      setExpandedStages(new Set(["0"]));
      setExpandedWeeks(new Set(["0-0"]));
    } catch {
      setError("Failed to generate plan. Please check your AI API key.");
    } finally {
      setGenerating(false);
    }
  }

  function toggleDay(day: string) {
    setForm((prev) => ({
      ...prev,
      trainingDays: prev.trainingDays.includes(day)
        ? prev.trainingDays.filter((d) => d !== day)
        : [...prev.trainingDays, day],
    }));
  }

  function toggleStage(idx: string) {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function toggleWeek(key: string) {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function openLogSession(stageIdx: number, weekIdx: number, sessionIdx: number) {
    const session = plan!.stages[stageIdx].weekPlans[weekIdx].sessions[sessionIdx];
    setLogForm({
      actualDistance: session.distance.replace(/[^0-9.]/g, ""),
      actualPace: session.targetPace,
      duration: "",
      feeling: 3,
      logNotes: "",
    });
    setLoggingSession({ stageIdx, weekIdx, sessionIdx });
  }

  function saveLog() {
    if (!loggingSession || !plan) return;
    const { stageIdx, weekIdx, sessionIdx } = loggingSession;
    const newPlan = { ...plan };
    const session = newPlan.stages[stageIdx].weekPlans[weekIdx].sessions[sessionIdx];
    session.actualDistance = logForm.actualDistance;
    session.actualPace = logForm.actualPace;
    session.duration = logForm.duration;
    session.feeling = logForm.feeling;
    session.logNotes = logForm.logNotes;
    session.isLogged = true;
    setPlan(newPlan);
    setLoggingSession(null);
  }

  const totalSessions = plan?.stages.reduce(
    (a, s) => a + s.weekPlans.reduce((b, w) => b + w.sessions.length, 0), 0
  ) ?? 0;

  const loggedSessions = plan?.stages.reduce(
    (a, s) => a + s.weekPlans.reduce((b, w) => b + w.sessions.filter((s) => s.isLogged).length, 0), 0
  ) ?? 0;

  return (
    <div style={{ padding: "32px 36px", maxWidth: "1100px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.5px" }}>Fitness</h1>
          <p style={{ color: "#888888", fontSize: "13px", marginTop: "4px" }}>AI-powered training plan tailored to your goals and fitness level.</p>
        </div>
        <button
          onClick={() => setShowSetup(true)}
          style={{ background: "#111111", color: "white", border: "none", borderRadius: "12px", padding: "10px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600 }}
        >
          {plan ? <><TrendingUp size={16} /> Update Plan</> : <><Plus size={16} /> Create Plan</>}
        </button>
      </div>

      {!plan ? (
        <div style={{ background: "white", borderRadius: "20px", padding: "60px", textAlign: "center", border: "1px solid #E8E4DE" }}>
          <div style={{ width: "64px", height: "64px", background: "#B8E8C8", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Dumbbell size={28} color="#111111" />
          </div>
          <h3 style={{ fontWeight: 700, fontSize: "18px", color: "#111111", marginBottom: "8px" }}>No training plan yet</h3>
          <p style={{ color: "#888888", fontSize: "13px", marginBottom: "20px", maxWidth: "380px", margin: "0 auto 20px" }}>
            Enter your fitness goals and target event — AI will build you a structured, progressive training plan.
          </p>
          <button onClick={() => setShowSetup(true)} style={{ background: "#111111", color: "white", border: "none", borderRadius: "12px", padding: "11px 22px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
            Create my plan
          </button>
        </div>
      ) : (
        <>
          {/* Stats bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
            {[
              { label: "Total Weeks", value: plan.totalWeeks, bg: "#B3D9F5" },
              { label: "Sessions Done", value: `${loggedSessions}/${totalSessions}`, bg: "#B8E8C8" },
              { label: "Target Pace", value: plan.targetPace, bg: "#F2E94E" },
              { label: "Stages", value: plan.stages.length, bg: "#FFB3D1" },
            ].map((stat) => (
              <div key={stat.label} style={{ background: stat.bg, borderRadius: "14px", padding: "16px 18px" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "#333333", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{stat.label}</p>
                <p style={{ fontSize: "22px", fontWeight: 800, color: "#111111" }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Overview */}
          <div style={{ background: "white", borderRadius: "16px", padding: "18px 20px", border: "1px solid #E8E4DE", marginBottom: "16px" }}>
            <p style={{ fontSize: "13px", color: "#555555", lineHeight: 1.6 }}>{plan.overview}</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
              {plan.tips.map((tip, i) => (
                <div key={i} style={{ background: "#FFFDE7", borderRadius: "8px", padding: "6px 10px", fontSize: "11px", color: "#555555", display: "flex", gap: "5px", alignItems: "center" }}>
                  <Sparkles size={10} color="#F2E94E" />{tip}
                </div>
              ))}
            </div>
          </div>

          {/* Stages */}
          {plan.stages.map((stage, si) => {
            const colors = STAGE_COLORS[stage.color];
            const isExpanded = expandedStages.has(String(si));
            return (
              <div key={si} style={{ background: "white", borderRadius: "16px", border: "1px solid #E8E4DE", marginBottom: "12px", overflow: "hidden" }}>
                <button
                  onClick={() => toggleStage(String(si))}
                  style={{ width: "100%", background: "transparent", border: "none", padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Dumbbell size={16} color="#111111" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: "15px", color: "#111111" }}>{stage.name}</p>
                    <p style={{ fontSize: "12px", color: "#888888" }}>{stage.weeks} · {stage.weeklyMileage} · {stage.description}</p>
                  </div>
                  {isExpanded ? <ChevronUp size={16} color="#888888" /> : <ChevronDown size={16} color="#888888" />}
                </button>

                {isExpanded && (
                  <div style={{ padding: "0 20px 20px" }}>
                    {stage.weekPlans.map((week, wi) => {
                      const weekKey = `${si}-${wi}`;
                      const isWeekExpanded = expandedWeeks.has(weekKey);
                      return (
                        <div key={wi} style={{ border: "1px solid #E8E4DE", borderRadius: "12px", marginBottom: "10px", overflow: "hidden" }}>
                          <button
                            onClick={() => toggleWeek(weekKey)}
                            style={{ width: "100%", background: "#F8F6F2", border: "none", padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}
                          >
                            <span style={{ fontWeight: 700, fontSize: "13px", color: "#111111" }}>Week {week.weekNumber}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "11px", color: "#888888" }}>{week.sessions.filter((s) => s.isLogged).length}/{week.sessions.length} logged</span>
                              {isWeekExpanded ? <ChevronUp size={14} color="#888888" /> : <ChevronDown size={14} color="#888888" />}
                            </div>
                          </button>

                          {isWeekExpanded && (
                            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                              {week.sessions.map((session, sesi) => (
                                <div key={sesi} style={{ background: session.isLogged ? "#F0FFF4" : colors.light, borderRadius: "12px", padding: "14px 16px", border: session.isLogged ? "1px solid #B8E8C8" : "1px solid transparent" }}>
                                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                        <span style={{ background: colors.bg, borderRadius: "5px", padding: "2px 8px", fontSize: "10px", fontWeight: 700, color: "#111111" }}>{session.day}</span>
                                        <span style={{ fontWeight: 700, fontSize: "13px", color: "#111111" }}>{session.type}</span>
                                        {session.isLogged && <CheckCircle2 size={14} color="#00CC66" />}
                                      </div>
                                      <p style={{ fontSize: "12px", color: "#555555", marginBottom: "4px" }}>{session.description}</p>
                                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                        {session.distance && <span style={{ fontSize: "11px", color: "#888888", display: "flex", alignItems: "center", gap: "3px" }}><TrendingUp size={10} />{session.distance}</span>}
                                        {session.targetPace && <span style={{ fontSize: "11px", color: "#888888", display: "flex", alignItems: "center", gap: "3px" }}><Clock size={10} />Target: {session.targetPace}</span>}
                                      </div>
                                      {(session.warmup || session.mainSet || session.cooldown) && (
                                        <div style={{ marginTop: "8px", fontSize: "11px", color: "#555555", lineHeight: 1.7 }}>
                                          {session.warmup && <div>🏃 <strong>Warm-up:</strong> {session.warmup}</div>}
                                          {session.mainSet && <div>⚡ <strong>Main:</strong> {session.mainSet}</div>}
                                          {session.cooldown && <div>🧘 <strong>Cool-down:</strong> {session.cooldown}</div>}
                                        </div>
                                      )}

                                      {/* Logged data */}
                                      {session.isLogged && (
                                        <div style={{ marginTop: "10px", background: "white", borderRadius: "8px", padding: "8px 12px", border: "1px solid #B8E8C8" }}>
                                          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "4px" }}>
                                            <span style={{ fontSize: "11px", color: "#333333" }}>✓ {session.actualDistance}km @ {session.actualPace}</span>
                                            <span style={{ fontSize: "11px", color: "#333333" }}>{session.duration} min</span>
                                            <span style={{ fontSize: "11px", color: FEELING_LABELS[session.feeling || 3].color, fontWeight: 700 }}>
                                              {Array.from({ length: session.feeling || 0 }).map((_, i) => <Star key={i} size={10} fill="currentColor" />)} {FEELING_LABELS[session.feeling || 3].label}
                                            </span>
                                          </div>
                                          {session.logNotes && <p style={{ fontSize: "11px", color: "#555555" }}>{session.logNotes}</p>}
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => openLogSession(si, wi, sesi)}
                                      style={{ background: session.isLogged ? "#E8E4DE" : "#111111", color: session.isLogged ? "#555555" : "white", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "11px", fontWeight: 600, flexShrink: 0, marginLeft: "12px" }}
                                    >
                                      {session.isLogged ? "Edit Log" : "Log Session"}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Setup Modal */}
      {showSetup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: "18px", color: "#111111" }}>Create Training Plan</h3>
                <p style={{ fontSize: "12px", color: "#888888", marginTop: "2px" }}>AI will build a progressive plan for your goal</p>
              </div>
              <button onClick={() => setShowSetup(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={20} color="#888888" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Your Goal *</label>
                <input
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  placeholder="e.g. Complete a 10km race, Run my first half marathon"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Target Event *</label>
                  <input
                    value={form.event}
                    onChange={(e) => setForm({ ...form, event: e.target.value })}
                    placeholder="e.g. City 10K Race"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Event Date *</label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Current Pace (min/km) *</label>
                <input
                  value={form.currentPace}
                  onChange={(e) => setForm({ ...form, currentPace: e.target.value })}
                  placeholder="e.g. 6:30"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>Training Days *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: form.trainingDays.includes(day) ? "#111111" : "#E8E4DE",
                        background: form.trainingDays.includes(day) ? "#111111" : "transparent",
                        color: form.trainingDays.includes(day) ? "white" : "#555555",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ background: "#FFF0F0", borderRadius: "10px", padding: "10px 14px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <AlertCircle size={14} color="#CC0000" />
                  <span style={{ fontSize: "12px", color: "#CC0000" }}>{error}</span>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{ padding: "12px", borderRadius: "12px", border: "none", background: generating ? "#888888" : "#111111", color: "white", fontWeight: 700, fontSize: "14px", cursor: generating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {generating ? (
                  <><div style={{ width: "14px", height: "14px", border: "2px solid transparent", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Generating plan...</>
                ) : (
                  <><Sparkles size={16} /> Generate Training Plan</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log session modal */}
      {loggingSession !== null && plan && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "440px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontWeight: 800, fontSize: "17px", color: "#111111" }}>Log Session</h3>
              <button onClick={() => setLoggingSession(null)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={20} color="#888888" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Distance (km)</label>
                  <input
                    value={logForm.actualDistance}
                    onChange={(e) => setLogForm({ ...logForm, actualDistance: e.target.value })}
                    placeholder="e.g. 5.2"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Avg Pace (min/km)</label>
                  <input
                    value={logForm.actualPace}
                    onChange={(e) => setLogForm({ ...logForm, actualPace: e.target.value })}
                    placeholder="e.g. 6:15"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Duration (minutes)</label>
                <input
                  value={logForm.duration}
                  onChange={(e) => setLogForm({ ...logForm, duration: e.target.value })}
                  placeholder="e.g. 32"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>How did you feel?</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setLogForm({ ...logForm, feeling: n })}
                      style={{ flex: 1, padding: "10px 4px", borderRadius: "10px", border: "2px solid", borderColor: logForm.feeling === n ? "#111111" : "#E8E4DE", background: logForm.feeling === n ? "#111111" : "transparent", cursor: "pointer", transition: "all 0.15s ease" }}
                    >
                      <Heart size={16} color={logForm.feeling === n ? FEELING_LABELS[n].color : "#CCCCCC"} style={{ display: "block", margin: "0 auto 3px" }} fill={logForm.feeling === n ? FEELING_LABELS[n].color : "none"} />
                      <span style={{ fontSize: "10px", color: logForm.feeling === n ? "white" : "#888888", fontWeight: 600 }}>{n}</span>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: "11px", color: "#888888", marginTop: "4px", textAlign: "center" }}>
                  {FEELING_LABELS[logForm.feeling].label}
                </p>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Notes (optional)</label>
                <textarea
                  value={logForm.logNotes}
                  onChange={(e) => setLogForm({ ...logForm, logNotes: e.target.value })}
                  placeholder="How did it go? Any aches, weather conditions, energy levels..."
                  rows={2}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2", resize: "none" }}
                />
              </div>

              <button
                onClick={saveLog}
                style={{ padding: "12px", borderRadius: "12px", border: "none", background: "#111111", color: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
              >
                Save Log
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
