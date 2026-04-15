"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, X, Clock, Tag } from "lucide-react";

type EventColor = "yellow" | "pink" | "green" | "blue" | "purple" | "orange";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  startTime: string;
  endTime: string;
  type: string;
  color: EventColor;
  notes: string;
}

const EVENT_COLORS: Record<EventColor, { bg: string; text: string; dot: string }> = {
  yellow: { bg: "#FEF9C3", text: "#854D0E", dot: "#F2E94E" },
  pink: { bg: "#FCE7F3", text: "#9D174D", dot: "#FFB3D1" },
  green: { bg: "#DCFCE7", text: "#166534", dot: "#B8E8C8" },
  blue: { bg: "#DBEAFE", text: "#1E40AF", dot: "#B3D9F5" },
  purple: { bg: "#F3E8FF", text: "#6B21A8", dot: "#DDB3F5" },
  orange: { bg: "#FFEDD5", text: "#9A3412", dot: "#FFD4B3" },
};

const EVENT_TYPES = ["Lecture", "Tutorial", "Lab", "Assignment Due", "Exam", "Gym", "Personal", "Other"];

const COLOR_OPTIONS: EventColor[] = ["yellow", "pink", "green", "blue", "purple", "orange"];

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<Omit<CalendarEvent, "id">>({
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:00",
    type: "Lecture",
    color: "blue",
    notes: "",
  });

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows: Date[][] = [];
  let day = startDate;
  while (day <= endDate) {
    const row: Date[] = [];
    for (let i = 0; i < 7; i++) {
      row.push(day);
      day = addDays(day, 1);
    }
    rows.push(row);
  }

  const getEventsForDate = (date: Date) =>
    events.filter((e) => isSameDay(new Date(e.date + "T00:00:00"), date));

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  function openAddModal(date?: Date) {
    setEditingEvent(null);
    setForm({
      title: "",
      date: format(date || selectedDate || new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "10:00",
      type: "Lecture",
      color: "blue",
      notes: "",
    });
    setShowModal(true);
  }

  function openEditModal(event: CalendarEvent) {
    setEditingEvent(event);
    setForm({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      color: event.color,
      notes: event.notes,
    });
    setShowModal(true);
  }

  function saveEvent() {
    if (!form.title.trim()) return;
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? { ...form, id: editingEvent.id } : e))
      );
    } else {
      setEvents((prev) => [...prev, { ...form, id: generateId() }]);
    }
    setShowModal(false);
  }

  function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div style={{ padding: "32px 36px", maxWidth: "1100px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.5px" }}>
          Calendar
        </h1>
        <p style={{ color: "#888888", fontSize: "13px", marginTop: "4px" }}>
          Add and manage your lectures, sessions, and events.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>
        {/* Calendar grid */}
        <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid #E8E4DE" }}>
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111" }}>
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                style={{ background: "#F8F6F2", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <ChevronLeft size={16} color="#555" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                style={{ background: "#F8F6F2", border: "none", borderRadius: "8px", padding: "0 12px", height: "32px", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#555" }}
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                style={{ background: "#F8F6F2", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <ChevronRight size={16} color="#555" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "8px" }}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", padding: "4px 0" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar rows */}
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
              {row.map((day) => {
                const dayEvents = getEventsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isT = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    style={{
                      minHeight: "72px",
                      padding: "6px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      background: isSelected ? "#111111" : "transparent",
                      opacity: isCurrentMonth ? 1 : 0.35,
                      transition: "background 0.15s ease",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLElement).style.background = "#F8F6F2";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
                      <span style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        background: isT && !isSelected ? "#F2E94E" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: isT || isSelected ? 700 : 400,
                        color: isSelected ? "white" : "#111111",
                      }}>
                        {format(day, "d")}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div key={ev.id} style={{
                          background: EVENT_COLORS[ev.color].dot,
                          borderRadius: "4px",
                          padding: "1px 4px",
                          fontSize: "9px",
                          fontWeight: 600,
                          color: "#111111",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div style={{ fontSize: "9px", color: isSelected ? "#888" : "#888", textAlign: "center" }}>
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Selected day panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "22px", border: "1px solid #E8E4DE" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {selectedDate ? format(selectedDate, "EEEE") : "Select a date"}
                </p>
                <p style={{ fontSize: "22px", fontWeight: 800, color: "#111111", letterSpacing: "-0.3px" }}>
                  {selectedDate ? format(selectedDate, "d MMMM") : ""}
                </p>
              </div>
              <button
                onClick={() => openAddModal(selectedDate || undefined)}
                style={{ background: "#111111", border: "none", borderRadius: "10px", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Plus size={18} color="white" />
              </button>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#888888", fontSize: "13px" }}>
                <p>No events this day.</p>
                <button
                  onClick={() => openAddModal(selectedDate || undefined)}
                  style={{ marginTop: "10px", background: "#F8F6F2", border: "1px dashed #CCCCCC", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontSize: "12px", color: "#555555" }}
                >
                  + Add event
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {selectedDateEvents.map((ev) => {
                  const colors = EVENT_COLORS[ev.color];
                  return (
                    <div key={ev.id}
                      style={{ background: colors.bg, borderRadius: "12px", padding: "12px 14px", cursor: "pointer", position: "relative" }}
                      onClick={() => openEditModal(ev)}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "13px", color: "#111111", marginBottom: "3px" }}>
                            {ev.title}
                          </p>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ background: colors.dot, borderRadius: "4px", padding: "1px 6px", fontSize: "10px", fontWeight: 600, color: "#111111" }}>
                              {ev.type}
                            </span>
                            <span style={{ fontSize: "11px", color: "#555555", display: "flex", alignItems: "center", gap: "3px" }}>
                              <Clock size={10} /> {ev.startTime} – {ev.endTime}
                            </span>
                          </div>
                          {ev.notes && (
                            <p style={{ fontSize: "11px", color: "#555555", marginTop: "5px" }}>{ev.notes}</p>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id); }}
                          style={{ background: "transparent", border: "none", cursor: "pointer", padding: "2px" }}
                        >
                          <X size={14} color="#888888" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ background: "white", borderRadius: "16px", padding: "16px 18px", border: "1px solid #E8E4DE" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
              <Tag size={10} /> Event types
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {EVENT_TYPES.map((t) => (
                <span key={t} style={{ background: "#F8F6F2", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", color: "#555555" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
              <h3 style={{ fontWeight: 800, fontSize: "17px", color: "#111111" }}>
                {editingEvent ? "Edit Event" : "Add Event"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={20} color="#888888" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Introduction to Psychology"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                  >
                    {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Start Time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>Colour</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      style={{ width: "28px", height: "28px", borderRadius: "50%", background: EVENT_COLORS[c].dot, border: form.color === c ? "3px solid #111111" : "3px solid transparent", cursor: "pointer" }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Room number, lecturer, reminders..."
                  rows={2}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                {editingEvent && (
                  <button
                    onClick={() => { deleteEvent(editingEvent.id); setShowModal(false); }}
                    style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid #FFCCCC", background: "#FFF0F0", color: "#CC0000", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={saveEvent}
                  style={{ flex: 2, padding: "11px", borderRadius: "10px", border: "none", background: "#111111", color: "white", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                >
                  {editingEvent ? "Save Changes" : "Add Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
