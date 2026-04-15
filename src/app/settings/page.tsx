"use client";

import { useState } from "react";
import { Settings, Key, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    // In a real app, this would be stored securely server-side
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ padding: "32px 36px", maxWidth: "700px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "32px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#F8F6F2", border: "1px solid #E8E4DE", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Settings size={22} color="#111111" />
        </div>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.5px" }}>Settings</h1>
          <p style={{ color: "#888888", fontSize: "13px", marginTop: "3px" }}>Configure Focus Flow</p>
        </div>
      </div>

      {/* AI Configuration */}
      <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid #E8E4DE", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <Key size={18} color="#111111" />
          <h2 style={{ fontWeight: 700, fontSize: "16px", color: "#111111" }}>AI Configuration</h2>
        </div>

        <div style={{ background: "#F8F6F2", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px", fontSize: "13px", color: "#555555", lineHeight: 1.6 }}>
          <strong>How AI features work:</strong> Focus Flow uses the Claude AI API for smart features like assignment planning, training plans, meal planning, and routines.
          Set your API key in the <code style={{ background: "#E8E4DE", padding: "1px 5px", borderRadius: "4px", fontSize: "12px" }}>.env.local</code> file as{" "}
          <code style={{ background: "#E8E4DE", padding: "1px 5px", borderRadius: "4px", fontSize: "12px" }}>ANTHROPIC_API_KEY</code>.
        </div>

        <div style={{ background: "#FFFDE7", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <AlertCircle size={16} color="#856404" style={{ flexShrink: 0, marginTop: "1px" }} />
          <div>
            <p style={{ fontSize: "13px", color: "#333333", marginBottom: "4px" }}>
              <strong>Security note:</strong> Never put your API key in client-side code. It is already wired up server-side via the <code style={{ background: "#E8E4DE", padding: "1px 4px", borderRadius: "3px" }}>ANTHROPIC_API_KEY</code> environment variable.
            </p>
            <a
              style={{ fontSize: "12px", color: "#555555", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}
            >
              <ExternalLink size={11} /> Get an API key from console.anthropic.com
            </a>
          </div>
        </div>

        <div>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>
            .env.local setup
          </label>
          <div style={{ background: "#111111", borderRadius: "10px", padding: "14px 16px", fontFamily: "monospace", fontSize: "13px", color: "#F2E94E" }}>
            ANTHROPIC_API_KEY=your_api_key_here
          </div>
        </div>
      </div>

      {/* About */}
      <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid #E8E4DE" }}>
        <h2 style={{ fontWeight: 700, fontSize: "16px", color: "#111111", marginBottom: "12px" }}>About Focus Flow</h2>
        <p style={{ fontSize: "13px", color: "#555555", lineHeight: 1.7, marginBottom: "12px" }}>
          Focus Flow is an ADHD-friendly life planner built to help you manage your schedule, education, fitness, daily routines, and nutrition — all in one place, with AI assistance to break overwhelming tasks into manageable steps.
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["Calendar", "Education AI", "Fitness Trainer", "Morning Routine", "Evening Routine", "Meal Planner"].map((feature) => (
            <span key={feature} style={{ background: "#F8F6F2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px", color: "#555555", border: "1px solid #E8E4DE" }}>
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
