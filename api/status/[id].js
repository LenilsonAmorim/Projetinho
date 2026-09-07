export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Método não permitido."
    });
  }

  const key = process.env.MAGIC_HOUR_API_KEY;

  if (!key) {
    return res.status(500).json({
      error: "MAGIC_HOUR_API_KEY não configurada no servidor."
    });
  }

  try {
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({
        error: "ID do vídeo não informado."
      });
    }

    const response = await fetch(
      `https://api.magichour.ai/v1/video-projects/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${key}`
        }
      }
    );

    const text = await response.text();

    return res.status(response.status).send(text);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
