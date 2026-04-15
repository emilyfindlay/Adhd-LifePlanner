import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { type, prompt, calendarEvents, wakeTime, bedTime } = await request.json();

    const isMorning = type === "morning";

    const systemPrompt = `You are an ADHD-friendly life coach specialising in daily routines. Create practical, structured routines that account for executive dysfunction, sensory sensitivities, and variable energy levels.`;

    const userPrompt = `Create a ${isMorning ? "morning" : "evening"} routine based on this person's preferences:

${prompt}

${isMorning ? `Wake time: ${wakeTime || "7:00 AM"}` : `Bed time: ${bedTime || "10:30 PM"}`}

${calendarEvents ? `Calendar context for ${isMorning ? "today" : "tomorrow"}: ${calendarEvents}` : ""}

Create THREE versions of the routine:
1. LOW MOOD / LOW ENERGY day — minimal viable routine (30-45 min max)
2. MEDIUM MOOD / AVERAGE day — standard routine (45-60 min)
3. HIGH MOOD / HIGH ENERGY day — full optimal routine (60-90 min)

Each routine should:
- Have clear, specific time-boxed steps (not vague)
- Include transition cues (what triggers moving to next step)
- Be ADHD-friendly (no multi-tasking, clear single actions)
- Include body-doubling or external cue suggestions where helpful
- For morning: prepare for the day shown in calendar
- For evening: wind down and prepare for next day

Return ONLY valid JSON:
{
  "low": {
    "name": "Low Energy Routine",
    "emoji": "🌧️",
    "totalTime": "35 min",
    "description": "Bare minimum to function and feel human",
    "steps": [
      {
        "time": "7:00",
        "duration": "2 min",
        "title": "Step title",
        "description": "Exact instructions",
        "tip": "ADHD tip for this step"
      }
    ]
  },
  "medium": { same structure },
  "high": { same structure }
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const routines = JSON.parse(content.text);
    return NextResponse.json({ routines });
  } catch (error) {
    console.error("Routine AI error:", error);
    return NextResponse.json({ error: "Failed to generate routine" }, { status: 500 });
  }
}
