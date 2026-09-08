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
      source_url: String(source_url || "").trim(),
      script: {
        type: "text",
        input: String(text).trim(),
        provider: {
          type: "microsoft",
          voice_id: "pt-BR-FranciscaNeural"
        }
      }
    };

    if (!payload.source_url) {
      return res.status(400).json({
        error: "URL da imagem não informada."
      });
    }

    const response = await fetch(
      "https://api.d-id.com/talks",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${key}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        raw: responseText
      };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data.description ||
          data.message ||
          data.kind ||
          data.error ||
          responseText ||
          "A D-ID recusou a geração.",
        status: response.status,
        details: data
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
