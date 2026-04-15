"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Dumbbell,
  Sunrise,
  Moon,
  UtensilsCrossed,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    section: "Main",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "#F2E94E" },
      { href: "/calendar", label: "Calendar", icon: Calendar, color: "#B3D9F5" },
    ],
  },
  {
    section: "Manage",
    items: [
      { href: "/education", label: "Education", icon: BookOpen, color: "#FFB3D1" },
      { href: "/fitness", label: "Fitness", icon: Dumbbell, color: "#B8E8C8" },
      { href: "/food-planner", label: "Food Planner", icon: UtensilsCrossed, color: "#FFD4B3" },
    ],
  },
  {
    section: "Daily",
    items: [
      { href: "/morning-routine", label: "Morning Routine", icon: Sunrise, color: "#F2E94E" },
      { href: "/evening-routine", label: "Evening Routine", icon: Moon, color: "#DDB3F5" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        background: "#111111",
        width: collapsed ? "72px" : "240px",
        minWidth: collapsed ? "72px" : "240px",
        transition: "width 0.25s ease, min-width 0.25s ease",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "24px 0" : "24px 20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: "1px solid #1E1E1E",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            background: "#F2E94E",
            borderRadius: "10px",
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Brain size={18} color="#111111" />
        </div>
        {!collapsed && (
          <span
            style={{
              color: "white",
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: "-0.3px",
              whiteSpace: "nowrap",
            }}
          >
            Focus Flow
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {navItems.map((section) => (
          <div key={section.section} style={{ marginBottom: "8px" }}>
            {!collapsed && (
              <p
                style={{
                  color: "#555555",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  padding: "12px 20px 6px",
                }}
              >
                {section.section}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: collapsed ? "12px 0" : "10px 20px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    margin: "2px 8px",
                    borderRadius: "10px",
                    background: isActive ? "#1E1E1E" : "transparent",
                    textDecoration: "none",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background = "#1A1A1A";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: isActive ? item.color : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "background 0.15s ease",
                    }}
                  >
                    <Icon
                      size={16}
                      color={isActive ? "#111111" : "#888888"}
                      style={{ transition: "color 0.15s ease" }}
                    />
                  </div>
                  {!collapsed && (
                    <span
                      style={{
                        color: isActive ? "white" : "#888888",
                        fontSize: "13.5px",
                        fontWeight: isActive ? 600 : 400,
                        whiteSpace: "nowrap",
                        transition: "color 0.15s ease",
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid #1E1E1E" }}>
        <Link
          href="/settings"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: collapsed ? "12px 0" : "10px 12px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: "10px",
            textDecoration: "none",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#1A1A1A")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "transparent")
          }
        >
          <Settings size={16} color="#555555" />
          {!collapsed && (
            <span style={{ color: "#555555", fontSize: "13.5px" }}>Settings</span>
          )}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "absolute",
          right: "-12px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "#111111",
          border: "1px solid #333333",
          borderRadius: "50%",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
          color: "#888888",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#1E1E1E";
          (e.currentTarget as HTMLElement).style.color = "white";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#111111";
          (e.currentTarget as HTMLElement).style.color = "#888888";
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
