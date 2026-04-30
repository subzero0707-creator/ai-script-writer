export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { platform, topic, tone, audience } = req.body;
  if (!topic) return res.status(400).json({ error: "Topic is required" });

  const platformGuide = {
    YouTube: "Write a detailed YouTube script with hook (first 15 seconds), structured main content with timestamps like [0:00], and CTA.",
    Reels: "Write a punchy Instagram Reels script under 60 seconds. Hook in first 3 seconds. Include visual cues in brackets.",
    TikTok: "Write a TikTok script under 60 seconds. Hook in first 2 seconds. Include on-screen text suggestions in brackets.",
  };

  const prompt = `You are an expert video script writer. Write a complete ${platform} video script.

Topic: ${topic}
Platform: ${platform}
Tone: ${tone}
Target audience: ${audience || "general audience"}

${platformGuide[platform]}

Structure your response EXACTLY like this:

HOOK:
[opening hook]

MAIN CONTENT:
[main body]

CALL TO ACTION:
[CTA]

Write the actual words the creator will say. Be engaging and natural.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const script = data.content?.map(i => i.text || "").join("") || "";
    res.status(200).json({ script });
  } catch (e) {
    res.status(500).json({ error: "Failed to generate script" });
  }
}
