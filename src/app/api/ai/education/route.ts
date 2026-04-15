import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { title, brief, deadline, currentDate } = await request.json();

    const prompt = `You are an ADHD-friendly academic coach. A student has an assignment with the following details:

Assignment Title: ${title}
Assignment Brief: ${brief}
Deadline: ${deadline}
Current Date: ${currentDate}

Create a detailed, ADHD-friendly action plan to complete this assignment. The plan should:
1. Break the work into small, manageable daily tasks (no task longer than 2 hours)
2. Account for ADHD challenges (starting tasks, maintaining focus, procrastination)
3. Build in buffer days before the deadline
4. Include specific, concrete actions (not vague like "research topic")
5. Start with the easiest tasks to build momentum

Return your response as a JSON object with this exact structure:
{
  "overview": "A 2-3 sentence summary of the approach",
  "totalDays": number,
  "stages": [
    {
      "name": "Stage name (e.g. Research & Understanding)",
      "description": "What this stage covers",
      "color": "one of: yellow, pink, green, blue, purple, orange",
      "days": [
        {
          "date": "YYYY-MM-DD",
          "dayLabel": "Day 1",
          "tasks": ["specific task 1", "specific task 2"],
          "estimatedHours": 1.5,
          "isBufferDay": false
        }
      ]
    }
  ],
  "tips": ["ADHD-specific tip 1", "tip 2", "tip 3"]
}

Important: Return ONLY valid JSON, no markdown, no extra text.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const plan = JSON.parse(content.text);
    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Education AI error:", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
