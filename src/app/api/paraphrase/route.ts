import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { text, tone } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API Key not configured' },
                { status: 500 }
            );
        }

        const prompt = `
      You are an expert social media manager for BNCC (Bina Nusantara Computer Club).
      Rewrite the following text for a LINE Broadcast message.
      
      Tone: ${tone || 'Professional'}
      Context: ${text}
      
      Requirements:
      - Keep it short, engaging, and clear.
      - Use appropriate emojis for LINE.
      - Ensure the core message is preserved.
      - If the tone is 'Fun', be casual and use slang if appropriate.
      - If the tone is 'Formal', be polite and structured.
      - Return ONLY the rewritten message text, no explanations.
    `;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API Error:', data);
            return NextResponse.json(
                { error: 'Failed to generate content' },
                { status: response.status }
            );
        }

        const paraphrasedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return NextResponse.json({ paraphrased: paraphrasedText.trim() });
    } catch (error) {
        console.error('Paraphrase error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
