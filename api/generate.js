export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const key = process.env.WIZZX_API_KEY;

  if (!key) {
    return res.status(500).json({
      error: "WIZZX_API_KEY não configurada no servidor."
    });
  }

  try {
    const body = req.body || {};
    const duration = Number(body.duration) || 5;
    const allowedDurations = [5, 8, 12];

    if (!allowedDurations.includes(duration)) {
      return res.status(400).json({ error: "Duração inválida." });
    }

    const allowedRatios = ["16:9", "4:3", "1:1", "3:4", "9:16", "21:9"];
    const aspectRatio = allowedRatios.includes(body.aspect_ratio)
      ? body.aspect_ratio
      : "9:16";

    const payload = {
      prompt: String(body.prompt || ""),
      type: "text-to-video",
      duration,
      resolution: "720p",
      aspect_ratio: aspectRatio,
      generate_audio: true,
      watermark: false
    };

    const response = await fetch(
      "https://api.wizzx.ai/api/v1/task/submit/seedance-1.5-pro",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const text = await response.text();
    return res.status(response.status).send(text);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
