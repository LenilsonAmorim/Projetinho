export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const key = process.env.MAGIC_HOUR_API_KEY;

  if (!key) {
    return res.status(500).json({
      error: "MAGIC_HOUR_API_KEY não configurada no servidor."
    });
  }

  try {
    const body = req.body || {};
    const duration = Number(body.duration) || 6;
    const aspectRatio = body.aspect_ratio || "9:16";

    const payload = {
      name: "Projetinho IA video",
      end_seconds: duration,
      aspect_ratio: aspectRatio,
      model: "ltx-2.5",
      audio: true,
      resolution: "480p",
      style: {
        prompt: String(body.prompt || "")
      }
    };

    const response = await fetch(
      "https://api.magichour.ai/v1/text-to-video",
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
