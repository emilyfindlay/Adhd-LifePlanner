"use client";

import { useState } from "react";
import { X, Sparkles, AlertCircle, ChevronDown, ChevronUp, Clock, Lightbulb } from "lucide-react";

type MoodLevel = "low" | "medium" | "high";

interface RoutineStep {
  time: string;
  duration: string;
  title: string;
  description: string;
  tip?: string;
}

interface MoodRoutine {
  name: string;
  emoji: string;
  totalTime: string;
  description: string;
  steps: RoutineStep[];
}

interface Routines {
  low: MoodRoutine;
  medium: MoodRoutine;
  high: MoodRoutine;
}

const MOOD_CONFIG: Record<MoodLevel, { label: string; emoji: string; bg: string; border: string; activeBg: string }> = {
  low: { label: "Low Energy", emoji: "🌧️", bg: "#FFF0F6", border: "#FFB3D1", activeBg: "#FFB3D1" },
  medium: { label: "Average Day", emoji: "🌤️", bg: "#EFF8FF", border: "#B3D9F5", activeBg: "#B3D9F5" },
  high: { label: "High Energy", emoji: "☀️", bg: "#FFFDE7", border: "#F2E94E", activeBg: "#F2E94E" },
};

interface RoutinePageProps {
  type: "morning" | "evening";
  title: string;
  description: string;
  placeholder: string;
  accentColor: string;
  accentBg: string;
  icon: React.ReactNode;
}

export default function RoutinePage({ type, title, description, placeholder, accentColor, accentBg, icon }: RoutinePageProps) {
  const [routines, setRoutines] = useState<Routines | null>(null);
  const [activeMood, setActiveMood] = useState<MoodLevel>("medium");
  const [showSetup, setShowSetup] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const [form, setForm] = useState({
    prompt: "",
    wakeOrBedTime: type === "morning" ? "7:00" : "22:30",
    calendarContext: "",
  });

  async function handleGenerate() {
    if (!form.prompt) return;
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/ai/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          prompt: form.prompt,
          calendarEvents: form.calendarContext,
          wakeTime: type === "morning" ? form.wakeOrBedTime : undefined,
          bedTime: type === "evening" ? form.wakeOrBedTime : undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setRoutines(data.routines);
      setShowSetup(false);
      setExpandedSteps(new Set());
    } catch {
      setError("Failed to generate routine. Please check your AI API key.");
    } finally {
      setGenerating(false);
    }
  }

  function toggleStep(idx: number) {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  const activeRoutine = routines?.[activeMood];
  const moodConfig = MOOD_CONFIG[activeMood];

  return (
    <div style={{ padding: "32px 36px", maxWidth: "900px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </div>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.5px" }}>{title}</h1>
            <p style={{ color: "#888888", fontSize: "13px", marginTop: "3px" }}>{description}</p>
          </div>
        </div>
        <button
          onClick={() => setShowSetup(true)}
          style={{ background: "#111111", color: "white", border: "none", borderRadius: "12px", padding: "10px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600 }}
        >
          {routines ? <><Sparkles size={16} /> Regenerate</> : <><Sparkles size={16} /> Generate Routine</>}
        </button>
      </div>

      {!routines ? (
        <div style={{ background: "white", borderRadius: "20px", padding: "60px", textAlign: "center", border: "1px solid #E8E4DE" }}>
          <div style={{ width: "64px", height: "64px", background: accentBg, borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            {icon}
          </div>
          <h3 style={{ fontWeight: 700, fontSize: "18px", color: "#111111", marginBottom: "8px" }}>No routine yet</h3>
          <p style={{ color: "#888888", fontSize: "13px", marginBottom: "20px", maxWidth: "380px", margin: "0 auto 20px" }}>
            Tell the AI about your {type === "morning" ? "morning" : "evening"} preferences and calendar — it will create 3 versions for different energy levels.
          </p>
          <button onClick={() => setShowSetup(true)} style={{ background: "#111111", color: "white", border: "none", borderRadius: "12px", padding: "11px 22px", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} /> Generate my routine
          </button>
        </div>
      ) : (
        <>
          {/* Mood selector */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {(["low", "medium", "high"] as MoodLevel[]).map((mood) => {
              const cfg = MOOD_CONFIG[mood];
              const isActive = mood === activeMood;
              return (
                <button
                  key={mood}
                  onClick={() => { setActiveMood(mood); setExpandedSteps(new Set()); }}
                  style={{ flex: 1, padding: "14px 16px", borderRadius: "14px", border: `2px solid ${isActive ? cfg.border : "#E8E4DE"}`, background: isActive ? cfg.activeBg : "white", cursor: "pointer", transition: "all 0.15s ease", textAlign: "left" }}
                >
                  <div style={{ fontSize: "20px", marginBottom: "4px" }}>{cfg.emoji}</div>
                  <p style={{ fontWeight: 700, fontSize: "13px", color: "#111111" }}>{cfg.label}</p>
                  <p style={{ fontSize: "11px", color: "#888888" }}>{routines[mood].totalTime}</p>
                </button>
              );
            })}
          </div>

          {/* How are you feeling today? Banner */}
          <div style={{ background: moodConfig.activeBg, borderRadius: "14px", padding: "14px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "28px" }}>{moodConfig.emoji}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: "14px", color: "#111111" }}>{activeRoutine?.name}</p>
              <p style={{ fontSize: "12px", color: "#333333" }}>{activeRoutine?.description}</p>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <p style={{ fontWeight: 700, fontSize: "18px", color: "#111111" }}>{activeRoutine?.totalTime}</p>
              <p style={{ fontSize: "11px", color: "#555555" }}>total time</p>
            </div>
          </div>

          {/* Steps */}
          {activeRoutine && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {activeRoutine.steps.map((step, idx) => {
                const isExpanded = expandedSteps.has(idx);
                return (
                  <div key={idx} style={{ background: "white", borderRadius: "14px", border: "1px solid #E8E4DE", overflow: "hidden" }}>
                    <button
                      onClick={() => toggleStep(idx)}
                      style={{ width: "100%", background: "transparent", border: "none", padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}
                    >
                      <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: moodConfig.activeBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "12px", fontWeight: 800, color: "#111111" }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: "13px", color: "#111111" }}>{step.title}</p>
                        <span style={{ fontSize: "11px", color: "#888888", display: "flex", alignItems: "center", gap: "3px" }}>
                          <Clock size={9} /> {step.time} · {step.duration}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp size={16} color="#888888" /> : <ChevronDown size={16} color="#888888" />}
                    </button>

                    {isExpanded && (
                      <div style={{ padding: "0 18px 16px 18px" }}>
                        <p style={{ fontSize: "13px", color: "#333333", lineHeight: 1.6, marginBottom: step.tip ? "10px" : 0 }}>
                          {step.description}
                        </p>
                        {step.tip && (
                          <div style={{ background: "#FFFDE7", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "#555555", display: "flex", gap: "6px", alignItems: "flex-start" }}>
                            <Lightbulb size={12} color="#F2E94E" style={{ flexShrink: 0, marginTop: "1px" }} />
                            <span><strong>ADHD tip:</strong> {step.tip}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Setup Modal */}
      {showSetup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: "18px", color: "#111111" }}>Set up {title}</h3>
                <p style={{ fontSize: "12px", color: "#888888", marginTop: "2px" }}>AI creates 3 plans for different mood days</p>
              </div>
              <button onClick={() => setShowSetup(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={20} color="#888888" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>
                  {type === "morning" ? "Wake time" : "Target bed time"}
                </label>
                <input
                  type="time"
                  value={form.wakeOrBedTime}
                  onChange={(e) => setForm({ ...form, wakeOrBedTime: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>
                  Your {type} preferences & needs *
                </label>
                <textarea
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                  placeholder={placeholder}
                  rows={4}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>
                  Calendar context (optional)
                </label>
                <textarea
                  value={form.calendarContext}
                  onChange={(e) => setForm({ ...form, calendarContext: e.target.value })}
                  placeholder={type === "morning" ? "e.g. 9am Lecture, 1pm Tutorial, Gym at 5pm" : "e.g. Tomorrow: 8am exam, need to be sharp"}
                  rows={2}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2", resize: "none" }}
                />
              </div>

              {error && (
                <div style={{ background: "#FFF0F0", borderRadius: "10px", padding: "10px 14px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <AlertCircle size={14} color="#CC0000" />
                  <span style={{ fontSize: "12px", color: "#CC0000" }}>{error}</span>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={generating || !form.prompt}
                style={{ padding: "12px", borderRadius: "12px", border: "none", background: generating ? "#888888" : "#111111", color: "white", fontWeight: 700, fontSize: "14px", cursor: generating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {generating ? (
                  <><div style={{ width: "14px", height: "14px", border: "2px solid transparent", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Generating routines...</>
                ) : (
                  <><Sparkles size={16} /> Generate 3 Routines</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
