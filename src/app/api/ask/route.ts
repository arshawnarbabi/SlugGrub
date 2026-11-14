// Owner: Ethan. Takes a question; returns dishes from tonight's menus.
// Gemini runs here only; the key never reaches the browser.

import { GoogleGenAI } from "@google/genai";
import { getAllMenus } from "@/lib/menus";
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { question?: unknown };
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    if (!question) {
      return Response.json({ error: "Question required" }, { status: 400 });
    }
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles",
    }).format(new Date());
    const menus = await getAllMenus(today);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Gemini API key not configured" }, { status: 500 });
    }
    const compactMenus = menus.map((m) => ({
      hallId: m.hallId,
      meals: Object.fromEntries(
        Object.entries(m.meals).map(([meal, dishes]) => [
          meal,
          (dishes ?? []).map((d) => ({
            name: d.name,
            category: d.category,
            portion: d.portion,
            calories: d.nutrition?.calories,
            proteinG: d.nutrition?.proteinG,
          })),
        ])
      ),
    }));
    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = `You are SlugGrub AI, an expert guide for UCSC dining halls.
Given today's dining hall menus, answer the student's question with specific recommendations.
Rules:
- Recommend 2-3 specific dishes that best match their dietary, calorie, or location request.
- Name the dining hall, meal (Breakfast, Lunch, Dinner, Late Night), calories, and protein if available.
- Keep responses friendly, concise, and under 3 short paragraphs.`;
    const prompt = `Student Question: "${question}"\n\nToday's UCSC Menu Data:\n${JSON.stringify(compactMenus)}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\n${prompt}` }] },
      ],
    });
    return Response.json({ answer: response.text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process question";
    return Response.json({ error: message }, { status: 500 });
  }
}
