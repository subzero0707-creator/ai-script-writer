export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { platform, topic, tone, audience } = req.body;
  if (!topic) return res.status(400).json({ error: "Topic is required" });

  const prompt = `Write a ${platform} video script about: ${topic}. Tone: ${tone}. Audience: ${audience || "general"}. Include a hook, main content, and call to action.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
      }),
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const script = data.choices?.[0]?.message?.content || "";
    res.status(200).json({ script });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
