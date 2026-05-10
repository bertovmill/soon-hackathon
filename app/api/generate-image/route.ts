import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(request: Request) {
  const { idea } = await request.json();

  if (!idea || typeof idea !== "string") {
    return Response.json({ error: "Missing 'idea' field" }, { status: 400 });
  }

  const prompt = `Product concept visualization: ${idea}. Professional product design render, clean background, modern aesthetic, high quality concept art.`;

  console.log("[generate-image] Received idea:", idea);
  console.log("[generate-image] Sending prompt to gpt-image-2...");

  try {
    const startTime = Date.now();
    const response = await openai.images.generate({
      model: "gpt-image-2",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "high",
    });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    const imageBase64 = response.data[0].b64_json;
    console.log(`[generate-image] Success in ${elapsed}s, image size: ${imageBase64?.length ?? 0} chars base64`);

    return Response.json({
      image: `data:image/png;base64,${imageBase64}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Image generation failed";
    console.error("[generate-image] Error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
