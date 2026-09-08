const $ = id => document.getElementById(id);

function promptFinal(idea) {
  return `Create a short social media video based exactly on this idea: ${idea}

Use high-quality cinematic AI video, coherent characters and appearance, natural motion, expressive acting, detailed environment, good composition and smooth camera movement.

Support any subject requested by the user: fictional people, fictional children, animals, creatures, characters, objects, places, vehicles, fantasy scenes, comedy, action and storytelling.

Keep the scene family-friendly and visually clear. Do not add captions, logos, watermarks or text on screen unless the user explicitly asks for text.

Generate synchronized audio that matches the action: natural ambience, sound effects, background music when appropriate, and character/environment sounds. If the prompt asks for speech, generate appropriate spoken dialogue and synchronize it with the scene.`;
}

async function api(path, options = {}) {
  const r = await fetch(path, options);
  const text = await r.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(text || `HTTP ${r.status}`);
  }

  if (!r.ok) {
    throw new Error(
      data.error?.message || data.error || data.msg || data.message || `HTTP ${r.status}`
    );
  }

  if (data.code !== undefined && data.code !== 0) {
    throw new Error(data.msg || data.error || "A API recusou a geração.");
  }

  return data;
}

$("generate").onclick = async () => {
  const idea = $("idea").value.trim();

  if (!idea) {
    $("idea").focus();
    setStatus("❌ Escreva uma ideia primeiro.", true);
    return;
  }

  $("generate").disabled = true;
  $("result").hidden = true;
  setStatus("Enviando para a IA...");

  try {
    let data = await api("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: promptFinal(idea),
        duration: Number($("duration").value),
        aspect_ratio: $("ratio").value
      })
    });

    let id = data.data?.task_id || data.task_id || data.id;

    if (!id) {
      throw new Error("A API não devolveu o ID da geração.");
    }

    let finished = false;

    for (let i = 0; i < 120; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));

      data = await api("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: id })
      });

      const info = data.data || data;
      const status = String(info.status || "").toUpperCase();

      setStatus(`Gerando vídeo com áudio... ${status || "PROCESSANDO"}`);

      if (["SUCCEEDED", "SUCCESS", "COMPLETED", "COMPLETE"].includes(status)) {
        finished = true;
        break;
      }

      if (["FAILED", "ERROR", "CANCELED", "CANCELLED"].includes(status)) {
        throw new Error(info.error || info.msg || "A geração do vídeo falhou.");
      }
    }

    if (!finished) {
      throw new Error("A geração demorou mais que o tempo limite. Tente novamente.");
    }

    const info = data.data || data;
    const url =
      info.result_urls?.[0] ||
      info.result_url ||
      info.output?.url ||
      info.output_url ||
      info.url;

    if (!url) {
      throw new Error("O vídeo terminou, mas a API não devolveu o MP4.");
    }

    $("video").src = url;
    $("download").href = url;
    $("result").hidden = false;
    setStatus("✅ Vídeo pronto com áudio!");
  } catch (e) {
    setStatus("❌ " + e.message, true);
  } finally {
    $("generate").disabled = false;
  }
};

function setStatus(text, error = false) {
  $("status").textContent = text;
  $("status").className = "status" + (error ? " error" : "");
}
