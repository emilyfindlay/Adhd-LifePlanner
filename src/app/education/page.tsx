"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  BookOpen,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  AlertCircle,
  Trash2,
} from "lucide-react";

type StageColor = "yellow" | "pink" | "green" | "blue" | "purple" | "orange";

interface DayTask {
  date: string;
  dayLabel: string;
  tasks: string[];
  estimatedHours: number;
  isBufferDay: boolean;
}

interface Stage {
  name: string;
  description: string;
  color: StageColor;
  days: DayTask[];
}

interface AssignmentPlan {
  overview: string;
  totalDays: number;
  stages: Stage[];
  tips: string[];
}

interface Assignment {
  id: string;
  title: string;
  brief: string;
  deadline: string;
  module: string;
  plan: AssignmentPlan | null;
  completedTasks: string[]; // "stageIndex-dayIndex-taskIndex"
  createdAt: string;
}

const STAGE_COLORS: Record<StageColor, { bg: string; light: string; text: string }> = {
  yellow: { bg: "#F2E94E", light: "#FFFDE7", text: "#111111" },
  pink: { bg: "#FFB3D1", light: "#FFF0F6", text: "#111111" },
  green: { bg: "#B8E8C8", light: "#F0FFF4", text: "#111111" },
  blue: { bg: "#B3D9F5", light: "#EFF8FF", text: "#111111" },
  purple: { bg: "#DDB3F5", light: "#F9F0FF", text: "#111111" },
  orange: { bg: "#FFD4B3", light: "#FFF8F0", text: "#111111" },
};

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function EducationPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    module: "",
    brief: "",
    deadline: "",
  });

  async function handleSubmit() {
    if (!form.title || !form.brief || !form.deadline) return;
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/ai/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          brief: form.brief,
          deadline: form.deadline,
          currentDate: format(new Date(), "yyyy-MM-dd"),
        }),
      });

      if (!res.ok) throw new Error("Failed to generate plan");
      const data = await res.json();

      const newAssignment: Assignment = {
        id: generateId(),
        title: form.title,
        module: form.module,
        brief: form.brief,
        deadline: form.deadline,
        plan: data.plan,
        completedTasks: [],
        createdAt: new Date().toISOString(),
      };

      setAssignments((prev) => [...prev, newAssignment]);
      setSelectedAssignment(newAssignment.id);
      setShowAddModal(false);
      setForm({ title: "", module: "", brief: "", deadline: "" });
    } catch {
      setError("Failed to generate plan. Please check your AI API key is set.");
    } finally {
      setGenerating(false);
    }
  }

  function toggleTask(assignmentId: string, taskKey: string) {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        const completed = a.completedTasks.includes(taskKey)
          ? a.completedTasks.filter((k) => k !== taskKey)
          : [...a.completedTasks, taskKey];
        return { ...a, completedTasks: completed };
      })
    );
  }

  function toggleStage(key: string) {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function deleteAssignment(id: string) {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    if (selectedAssignment === id) setSelectedAssignment(null);
  }

  const selected = assignments.find((a) => a.id === selectedAssignment);

  const getProgress = (assignment: Assignment) => {
    if (!assignment.plan) return 0;
    const total = assignment.plan.stages.reduce(
      (acc, s) => acc + s.days.reduce((a, d) => a + d.tasks.length, 0),
      0
    );
    if (total === 0) return 0;
    return Math.round((assignment.completedTasks.length / total) * 100);
  };

  const getDaysLeft = (deadline: string) => {
    const d = new Date(deadline);
    const now = new Date();
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: "1100px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.5px" }}>Education</h1>
          <p style={{ color: "#888888", fontSize: "13px", marginTop: "4px" }}>AI-powered assignment planning, broken into daily tasks.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ background: "#111111", color: "white", border: "none", borderRadius: "12px", padding: "10px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600 }}
        >
          <Plus size={16} /> Add Assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <div style={{ background: "white", borderRadius: "20px", padding: "60px", textAlign: "center", border: "1px solid #E8E4DE" }}>
          <div style={{ width: "64px", height: "64px", background: "#FFB3D1", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <BookOpen size={28} color="#111111" />
          </div>
          <h3 style={{ fontWeight: 700, fontSize: "18px", color: "#111111", marginBottom: "8px" }}>No assignments yet</h3>
          <p style={{ color: "#888888", fontSize: "13px", marginBottom: "20px", maxWidth: "360px", margin: "0 auto 20px" }}>
            Add an assignment brief and deadline — AI will create a day-by-day plan to help you finish it.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ background: "#111111", color: "white", border: "none", borderRadius: "12px", padding: "11px 22px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
          >
            Add your first assignment
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px" }}>
          {/* Assignment list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {assignments.map((a) => {
              const progress = getProgress(a);
              const daysLeft = getDaysLeft(a.deadline);
              const isSelected = selectedAssignment === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedAssignment(a.id)}
                  style={{ background: isSelected ? "#111111" : "white", borderRadius: "14px", padding: "16px", cursor: "pointer", border: isSelected ? "none" : "1px solid #E8E4DE", transition: "all 0.15s ease" }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: "13px", color: isSelected ? "white" : "#111111", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.title}
                      </p>
                      {a.module && (
                        <p style={{ fontSize: "11px", color: isSelected ? "#888888" : "#888888", marginBottom: "8px" }}>{a.module}</p>
                      )}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteAssignment(a.id); }} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0 0 0 8px", flexShrink: 0 }}>
                      <Trash2 size={13} color={isSelected ? "#666" : "#CCCCCC"} />
                    </button>
                  </div>
                  <div style={{ background: isSelected ? "#222222" : "#F8F6F2", borderRadius: "8px", height: "4px", marginBottom: "8px", overflow: "hidden" }}>
                    <div style={{ width: `${progress}%`, height: "100%", background: isSelected ? "#F2E94E" : "#B8E8C8", borderRadius: "8px", transition: "width 0.3s ease" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px", color: isSelected ? "#888888" : "#888888" }}>{progress}% done</span>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: daysLeft <= 3 ? "#FF4444" : daysLeft <= 7 ? "#FF8800" : isSelected ? "#888888" : "#555555" }}>
                      {daysLeft <= 0 ? "Due today!" : `${daysLeft}d left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plan view */}
          {selected && selected.plan ? (
            <div style={{ minWidth: 0 }}>
              {/* Overview */}
              <div style={{ background: "white", borderRadius: "20px", padding: "22px", border: "1px solid #E8E4DE", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div>
                    <h2 style={{ fontWeight: 800, fontSize: "18px", color: "#111111", letterSpacing: "-0.3px" }}>{selected.title}</h2>
                    <p style={{ fontSize: "12px", color: "#888888", marginTop: "2px" }}>Due {format(new Date(selected.deadline), "d MMMM yyyy")}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "#111111", lineHeight: 1 }}>{getProgress(selected)}%</div>
                    <div style={{ fontSize: "11px", color: "#888888" }}>complete</div>
                  </div>
                </div>
                <div style={{ background: "#F8F6F2", borderRadius: "8px", height: "6px", marginBottom: "14px", overflow: "hidden" }}>
                  <div style={{ width: `${getProgress(selected)}%`, height: "100%", background: "#B8E8C8", borderRadius: "8px", transition: "width 0.3s ease" }} />
                </div>
                <p style={{ fontSize: "13px", color: "#555555", lineHeight: 1.6 }}>{selected.plan.overview}</p>

                {/* Tips */}
                <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {selected.plan.tips.map((tip, i) => (
                    <div key={i} style={{ background: "#FFFDE7", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "#555555", display: "flex", gap: "6px", alignItems: "flex-start" }}>
                      <Sparkles size={12} color="#F2E94E" style={{ flexShrink: 0, marginTop: "1px" }} />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stages */}
              {selected.plan.stages.map((stage, si) => {
                const colors = STAGE_COLORS[stage.color];
                const stageKey = `${selected.id}-${si}`;
                const isExpanded = expandedStages.has(stageKey);
                const stageTasks = stage.days.reduce((a, d) => a + d.tasks.length, 0);
                const stageDone = stage.days.reduce(
                  (a, d) =>
                    a + d.tasks.filter((_, ti) => selected.completedTasks.includes(`${si}-${stage.days.indexOf(d)}-${ti}`)).length,
                  0
                );

                return (
                  <div key={si} style={{ background: "white", borderRadius: "16px", border: "1px solid #E8E4DE", marginBottom: "12px", overflow: "hidden" }}>
                    <button
                      onClick={() => toggleStage(stageKey)}
                      style={{ width: "100%", background: "transparent", border: "none", padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}
                    >
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: colors.bg, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: "14px", color: "#111111" }}>{stage.name}</p>
                        <p style={{ fontSize: "12px", color: "#888888" }}>{stage.description}</p>
                      </div>
                      <span style={{ fontSize: "12px", color: "#888888", flexShrink: 0 }}>
                        {stageDone}/{stageTasks} tasks
                      </span>
                      {isExpanded ? <ChevronUp size={16} color="#888888" /> : <ChevronDown size={16} color="#888888" />}
                    </button>

                    {isExpanded && (
                      <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {stage.days.map((day, di) => (
                          <div key={di} style={{ background: day.isBufferDay ? "#F8F6F2" : colors.light, borderRadius: "12px", padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontWeight: 700, fontSize: "12px", color: "#111111" }}>{day.dayLabel}</span>
                                <span style={{ fontSize: "11px", color: "#888888" }}>{format(new Date(day.date + "T00:00:00"), "EEE d MMM")}</span>
                                {day.isBufferDay && <span style={{ background: "#E8E4DE", borderRadius: "4px", padding: "1px 6px", fontSize: "10px", color: "#888888" }}>Buffer</span>}
                              </div>
                              <span style={{ fontSize: "11px", color: "#888888", display: "flex", alignItems: "center", gap: "3px" }}>
                                <Clock size={10} /> ~{day.estimatedHours}h
                              </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              {day.tasks.map((task, ti) => {
                                const taskKey = `${si}-${di}-${ti}`;
                                const done = selected.completedTasks.includes(taskKey);
                                return (
                                  <label key={ti} style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer" }}>
                                    <input type="checkbox" checked={done} onChange={() => toggleTask(selected.id, taskKey)} style={{ display: "none" }} />
                                    {done ? <CheckCircle2 size={16} color="#B8E8C8" style={{ flexShrink: 0, marginTop: "1px" }} /> : <Circle size={16} color="#CCCCCC" style={{ flexShrink: 0, marginTop: "1px" }} />}
                                    <span style={{ fontSize: "13px", color: done ? "#AAAAAA" : "#333333", textDecoration: done ? "line-through" : "none", lineHeight: 1.4 }}>
                                      {task}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            selected && !selected.plan && (
              <div style={{ background: "white", borderRadius: "20px", padding: "40px", textAlign: "center", border: "1px solid #E8E4DE" }}>
                <p style={{ color: "#888888" }}>No plan generated yet.</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: "18px", color: "#111111" }}>Add Assignment</h3>
                <p style={{ fontSize: "12px", color: "#888888", marginTop: "2px" }}>AI will create a daily action plan for you</p>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={20} color="#888888" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Assignment Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Essay on Climate Change"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Module / Course</label>
                  <input
                    value={form.module}
                    onChange={(e) => setForm({ ...form, module: e.target.value })}
                    placeholder="e.g. Environmental Science"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Deadline *</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Assignment Brief *</label>
                <textarea
                  value={form.brief}
                  onChange={(e) => setForm({ ...form, brief: e.target.value })}
                  placeholder="Paste or describe the full assignment brief here. Include word count, marking criteria, required sources, format requirements, etc."
                  rows={5}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2", resize: "vertical" }}
                />
              </div>

              {error && (
                <div style={{ background: "#FFF0F0", borderRadius: "10px", padding: "10px 14px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <AlertCircle size={14} color="#CC0000" />
                  <span style={{ fontSize: "12px", color: "#CC0000" }}>{error}</span>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={generating || !form.title || !form.brief || !form.deadline}
                style={{ padding: "12px", borderRadius: "12px", border: "none", background: generating ? "#888888" : "#111111", color: "white", fontWeight: 700, fontSize: "14px", cursor: generating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {generating ? (
                  <>
                    <div style={{ width: "14px", height: "14px", border: "2px solid transparent", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Generating your plan...
                  </>
                ) : (
                  <><Sparkles size={16} /> Generate AI Plan</>
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
