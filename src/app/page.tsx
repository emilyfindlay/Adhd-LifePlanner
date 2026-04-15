"use client";

import { format, isToday, addDays } from "date-fns";
import {
  BookOpen,
  Dumbbell,
  Sunrise,
  Moon,
  UtensilsCrossed,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

const quickLinks = [
  { href: "/calendar", label: "Calendar", icon: Calendar, bg: "#B3D9F5", description: "Manage your schedule" },
  { href: "/education", label: "Education", icon: BookOpen, bg: "#FFB3D1", description: "Assignment tracker" },
  { href: "/fitness", label: "Fitness", icon: Dumbbell, bg: "#B8E8C8", description: "Training plan" },
  { href: "/morning-routine", label: "Morning", icon: Sunrise, bg: "#F2E94E", description: "Start your day right" },
  { href: "/evening-routine", label: "Evening", icon: Moon, bg: "#DDB3F5", description: "Wind down routine" },
  { href: "/food-planner", label: "Food", icon: UtensilsCrossed, bg: "#FFD4B3", description: "Meal planner" },
];

const upcomingDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

const tips = [
  "Break big tasks into 25-minute focus blocks using the Pomodoro technique.",
  "Your brain works best with clear, visual schedules — check your calendar each morning.",
  "Celebrate small wins! Every completed task deserves acknowledgement.",
  "When overwhelmed, pick just ONE task to focus on right now.",
  "Movement boosts dopamine — even a 5-minute walk can reset your focus.",
  "Use your morning routine section to build consistent daily habits.",
  "Log your fitness sessions honestly — the AI will adapt your plan to reality.",
];
const todayTip = tips[new Date().getDay() % tips.length];

export default function Dashboard() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ padding: "32px 36px", maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{ color: "#888888", fontSize: "13px", marginBottom: "4px" }}>
          {format(now, "EEEE, MMMM d, yyyy")}
        </p>
        <h1 style={{ fontSize: "34px", fontWeight: 800, color: "#111111", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
          {greeting} 👋
        </h1>
        <p style={{ color: "#555555", fontSize: "14px", marginTop: "8px" }}>
          Here&apos;s your Focus Flow overview for today.
        </p>
      </div>

      {/* ADHD Tip */}
      <div style={{ background: "#F2E94E", borderRadius: "16px", padding: "18px 22px", marginBottom: "28px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div style={{ background: "#111111", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Zap size={16} color="#F2E94E" />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: "11px", color: "#111111", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
            ADHD Focus Tip
          </p>
          <p style={{ color: "#333333", fontSize: "13.5px", lineHeight: 1.6 }}>{todayTip}</p>
        </div>
      </div>

      {/* Quick Links Grid */}
      <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", marginBottom: "14px" }}>
        Your Sections
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", marginBottom: "28px" }}>
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{ background: "white", borderRadius: "16px", padding: "18px 14px", textDecoration: "none", border: "1px solid #E8E4DE", transition: "all 0.2s ease", display: "block" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: link.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <Icon size={18} color="#111111" />
              </div>
              <p style={{ fontWeight: 700, fontSize: "13px", color: "#111111", marginBottom: "3px" }}>{link.label}</p>
              <p style={{ color: "#888888", fontSize: "11px", lineHeight: 1.4 }}>{link.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Week strip + Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "28px" }}>
        {/* Week strip */}
        <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #E8E4DE", gridColumn: "span 2" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontWeight: 700, fontSize: "14px", color: "#111111" }}>This Week</h3>
            <Link href="/calendar" style={{ color: "#888888", fontSize: "12px", textDecoration: "none" }}>View calendar →</Link>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {upcomingDays.map((day) => {
              const isT = isToday(day);
              return (
                <div key={day.toISOString()} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 4px", borderRadius: "12px", background: isT ? "#111111" : "transparent" }}>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: "#888888", textTransform: "uppercase" }}>
                    {format(day, "EEE")}
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: isT ? "white" : "#111111" }}>
                    {format(day, "d")}
                  </span>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: isT ? "#F2E94E" : "transparent" }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ background: "#B8E8C8", borderRadius: "16px", padding: "18px", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <TrendingUp size={14} color="#111111" />
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#333333", textTransform: "uppercase", letterSpacing: "0.5px" }}>Streak</span>
            </div>
            <p style={{ fontSize: "26px", fontWeight: 800, color: "#111111" }}>0</p>
            <p style={{ fontSize: "11px", color: "#333333" }}>days in a row</p>
          </div>
          <div style={{ background: "#FFB3D1", borderRadius: "16px", padding: "18px", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <CheckCircle2 size={14} color="#111111" />
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#333333", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tasks</span>
            </div>
            <p style={{ fontSize: "26px", fontWeight: 800, color: "#111111" }}>0</p>
            <p style={{ fontSize: "11px", color: "#333333" }}>completed today</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "#111111", borderRadius: "16px", padding: "22px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <h3 style={{ color: "white", fontWeight: 700, fontSize: "16px", marginBottom: "5px" }}>Ready to get started?</h3>
          <p style={{ color: "#888888", fontSize: "13px", lineHeight: 1.5 }}>
            Begin by adding your weekly schedule to the Calendar, then set up your Education and Fitness goals.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
          <Link href="/calendar" style={{ background: "#F2E94E", color: "#111111", padding: "10px 18px", borderRadius: "10px", fontWeight: 700, fontSize: "13px", textDecoration: "none", whiteSpace: "nowrap" }}>
            Set up Calendar
          </Link>
          <Link href="/education" style={{ background: "#1E1E1E", color: "white", padding: "10px 18px", borderRadius: "10px", fontWeight: 600, fontSize: "13px", textDecoration: "none", whiteSpace: "nowrap", border: "1px solid #333333" }}>
            Add Assignment
          </Link>
        </div>
      </div>

      <div style={{ height: "40px" }} />
    </div>
  );
}
