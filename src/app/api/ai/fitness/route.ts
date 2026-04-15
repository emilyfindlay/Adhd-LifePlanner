import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "generate") {
      const { goal, event, eventDate, currentPace, trainingDays, currentDate } = body;

      const prompt = `You are an expert running/fitness coach. Create a detailed training plan for an athlete with these details:

Goal: ${goal}
Target Event: ${event}
Event Date: ${eventDate}
Current Pace: ${currentPace} min/km
Available Training Days per Week: ${trainingDays.join(", ")}
Current Date: ${currentDate}

Create a progressive training plan. Return ONLY valid JSON with this structure:
{
  "overview": "Brief overview of the training approach",
  "targetPace": "goal pace for event in min/km",
  "totalWeeks": number,
  "stages": [
    {
      "name": "Stage name (e.g. Base Building)",
      "weeks": "Weeks 1-4",
      "description": "What this stage focuses on",
      "color": "one of: yellow, pink, green, blue, purple, orange",
      "weeklyMileage": "e.g. 20-25km per week",
      "weekPlans": [
        {
          "weekNumber": 1,
          "sessions": [
            {
              "day": "Monday",
              "type": "Easy Run",
              "description": "5km easy @ 6:30/km",
              "distance": "5km",
              "targetPace": "6:30/km",
              "warmup": "500m walk/jog",
              "mainSet": "5km continuous",
              "cooldown": "500m walk",
              "notes": "Keep conversational pace"
            }
          ]
        }
      ]
    }
  ],
  "tips": ["training tip 1", "tip 2", "tip 3"]
}`;

      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      });

      const content = message.content[0];
      if (content.type !== "text") throw new Error("Unexpected response type");

      const plan = JSON.parse(content.text);
      return NextResponse.json({ plan });
    }

    if (action === "feedback") {
      const { sessionLog, upcomingSessions } = body;

      const prompt = `You are a running coach. A runner has logged a session:

Session Logged:
- Planned: ${sessionLog.description}
- Actual Distance: ${sessionLog.actualDistance}km
- Actual Pace: ${sessionLog.actualPace} min/km
- Duration: ${sessionLog.duration} minutes
- How they felt: ${sessionLog.feeling}/5 (1=terrible, 5=excellent)
- Notes: ${sessionLog.notes || "None"}

Upcoming sessions:
${upcomingSessions.map((s: { description: string }, i: number) => `${i + 1}. ${s.description}`).join("\n")}

Based on this logged session, provide:
1. Brief feedback on their performance (2-3 sentences, encouraging but honest)
2. Specific adjustments for their next 2-3 sessions

Return ONLY valid JSON:
{
  "feedback": "Your encouraging feedback here",
  "adjustments": [
    {
      "sessionIndex": 0,
      "originalDescription": "original session description",
      "adjustedDescription": "new adjusted session description",
      "reason": "Why this adjustment was made"
    }
  ]
}`;

      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      });

      const content = message.content[0];
      if (content.type !== "text") throw new Error("Unexpected response type");

      const result = JSON.parse(content.text);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Fitness AI error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
