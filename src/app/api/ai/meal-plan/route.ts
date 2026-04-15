import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { recipes, preferences, calendarContext, weekStartDate } = await request.json();

    const recipeList = recipes.map((r: { name: string; description: string }, i: number) => `${i + 1}. ${r.name}: ${r.description}`).join("\n");

    const prompt = `You are a meal planning assistant helping someone with ADHD create a practical weekly meal plan.

Dietary preferences and notes: ${preferences || "No specific preferences"}

Stored recipes available:
${recipeList || "No recipes stored yet — use simple, easy meal ideas"}

Weekly calendar context (to match meals to energy requirements):
${calendarContext || "No calendar context provided"}

Create a 7-day meal plan starting from ${weekStartDate}.

For ADHD, keep meals:
- Simple to prepare (especially on busy days)
- Nutritious for brain health and focus
- Varied but not overwhelming
- Batch-cooking friendly where possible

Return ONLY valid JSON:
{
  "weekOf": "${weekStartDate}",
  "shoppingList": ["item 1", "item 2"],
  "prepTips": ["Batch cook X on Sunday", "Prep Y in advance"],
  "days": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "Monday",
      "energyNote": "Busy lecture day — keep meals quick",
      "breakfast": {
        "name": "Meal name",
        "description": "Quick description",
        "prepTime": "5 min",
        "isFromRecipes": true,
        "calories": "~350 kcal"
      },
      "lunch": { same structure },
      "dinner": { same structure },
      "snacks": [
        { "name": "Snack name", "description": "brief", "prepTime": "2 min" }
      ]
    }
  ]
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const mealPlan = JSON.parse(content.text);
    return NextResponse.json({ mealPlan });
  } catch (error) {
    console.error("Meal plan AI error:", error);
    return NextResponse.json({ error: "Failed to generate meal plan" }, { status: 500 });
  }
}
