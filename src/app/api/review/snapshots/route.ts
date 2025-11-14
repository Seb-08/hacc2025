// src/app/api/ai/summary/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    '⚠️ GEMINI_API_KEY is not set. AI summary endpoint will fail until this is configured.'
  );
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const MODEL_NAME = 'gemini-2.0-flash';

export async function POST(req: Request) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: 'AI is not configured. Missing GEMINI_API_KEY.' },
        { status: 500 },
      );
    }

    const body = await req.json();

    // 🛡 Accept either { snapshot: {...} } or a direct object as the payload
    const snapshot = body?.snapshot ?? body;

    if (!snapshot || typeof snapshot !== 'object') {
      console.error('❌ AI summary: invalid or missing snapshot payload:', body);
      return NextResponse.json(
        { error: 'Missing snapshot payload' },
        { status: 400 },
      );
    }

    const {
      name,
      department,
      issues = [],
      scheduleScope = [],
      financials = [],
      appendix = [],
    } = snapshot;

    const prompt = `
You are assisting the State of Hawai‘i ETS IV&V reporting portal.

Given the following structured report data, write a concise, professional overview (3–6 sentences) that:
- Summarizes the current project status
- Highlights key issues and risks (if any)
- Reflects schedule/milestone progress
- Briefly comments on financial posture (e.g., paid to date vs contract)
- Uses clear, neutral, government-appropriate language
- Does not use headings, bullet points, or markdown; return a single cohesive paragraph.

Report Data (JSON):
${JSON.stringify(
  {
    name,
    department,
    issues,
    scheduleScope,
    financials,
    appendix,
  },
  null,
  2,
)}
    `.trim();

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    const response = result.response;
    const text = response.text().trim();

    if (!text) {
      console.error('❌ Gemini returned empty content for snapshot:', snapshot);
      return NextResponse.json(
        { error: 'Model did not return any content' },
        { status: 500 },
      );
    }

    return NextResponse.json({ summary: text }, { status: 200 });
  } catch (err: any) {
    console.error('AI summary error (Gemini):', err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          'Failed to generate AI summary using Gemini.',
      },
      { status: 500 },
    );
  }
}