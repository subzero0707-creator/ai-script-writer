export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { platform, topic, tone, audience } = req.body;
  if (!topic) return res.status(400).json({ error: "Topic is required" });

  const prompt = `Write a ${platform} video script about: ${topic}. Tone: ${tone}. Audience: ${audience || "general"}. Include a hook, main content, and call to action.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const script = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.status(200).json({ script });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
