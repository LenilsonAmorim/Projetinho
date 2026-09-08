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
    const taskId = body.task_id;

    if (!taskId) {
      return res.status(400).json({ error: "task_id não informado." });
    }

    const response = await fetch(
      "https://api.wizzx.ai/api/v1/task/status",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ task_id: taskId })
      }
    );

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).send(text);
    }

    return res.status(200).send(text);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
