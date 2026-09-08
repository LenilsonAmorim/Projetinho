export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido."
    });
  }

  const key = process.env.D_ID_API_KEY;

  if (!key) {
    return res.status(500).json({
      error: "D_ID_API_KEY não configurada no servidor."
    });
  }

  try {
    const {
      text,
      source_url
    } = req.body || {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({
        error: "Digite o texto que o avatar deve falar."
      });
    }

    const payload = {
      script: {
        type: "text",
        input: String(text).trim(),
        provider: {
          type: "microsoft",
          voice_id: "pt-BR-FranciscaNeural"
        }
      }
    };

    if (source_url && String(source_url).trim()) {
      payload.source_url = String(source_url).trim();
    }

    const response = await fetch(
      "https://api.d-id.com/talks",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data.description ||
          data.message ||
          data.kind ||
          "A D-ID recusou a geração."
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
