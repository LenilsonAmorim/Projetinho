export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const key = process.env.WIZZX_API_KEY;

  if (!key) {
    return res.status(500).json({ error: "WIZZX_API_KEY não configurada no servidor." });
  }

  try {
    const body = req.body || {};
    const duration = Number(body.duration) || 5;

    if (duration < 4 || duration > 12) {
      return res.status(400).json({ error: "A duração deve estar entre 4 e 12 segundos." });
    }

    const allowedRatios = ["16:9", "9:16", "1:1", "4:3"];
    const aspectRatio = allowedRatios.includes(body.aspect_ratio) ? body.aspect_ratio : "9:16";

    // Campos alinhados ao contrato HTTP atual da Wizzx para Seedance 1.5 Pro.
    const payload = {
      prompt: String(body.prompt || ""),
      type: "text-to-video",
      duration,
      resolution: "720p",
      aspect_ratio: aspectRatio,
      generate_audio: true
    };

    const response = await fetch(
      "https://api.wizzx.ai/api/v1/task/submit/seedance-1.5-pro",
      {
        method: "POST",
        headers: {
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
