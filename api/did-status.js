export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const key = process.env.D_ID_API_KEY;

  if (!key) {
    return res.status(500).json({
      error: "D_ID_API_KEY não configurada no servidor."
    });
  }

  const id = String(req.query?.id || "").trim();

  if (!id) {
    return res.status(400).json({
      error: "ID do vídeo não informado."
    });
  }

  try {
    const response = await fetch(
      `https://api.d-id.com/talks/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${key}`,
          Accept: "application/json"
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data.description ||
          data.message ||
          data.kind ||
          "A D-ID recusou a consulta."
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
