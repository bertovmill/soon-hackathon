import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(request: Request) {
  const { companyName, companyContext } = await request.json();

  if (!companyName || typeof companyName !== "string") {
    return Response.json({ error: "Missing 'companyName' field" }, { status: 400 });
  }

  const prompt = `You are a brand strategist. Analyze the following company and extract key brand attributes that would inform new product development.

Company: ${companyName}
${companyContext ? `\nAdditional context provided by the user:\n${companyContext}` : ""}

Respond in JSON format with these fields:
{
  "brandValues": ["list of 3-5 core brand values"],
  "colorPalette": ["list of 3-5 brand colors as hex codes"],
  "targetAudience": "description of primary target audience",
  "brandPersonality": "2-3 sentence description of brand personality and tone",
  "competitivePositioning": "1-2 sentence summary of how the brand positions itself",
  "designStyle": "description of the visual/design aesthetic the brand uses (e.g. minimalist, bold, playful, premium)"
}

Only respond with valid JSON, no markdown or extra text.`;

  console.log("[analyze-company] Analyzing:", companyName);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return Response.json({ error: "No response from AI" }, { status: 500 });
    }

    const analysis = JSON.parse(content);
    console.log("[analyze-company] Success for:", companyName);

    return Response.json({ analysis });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Company analysis failed";
    console.error("[analyze-company] Error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
