const $ = id => document.getElementById(id);

function promptFinal(idea) {
  return `Create a short social media video based exactly on this idea: ${idea}

Use high-quality cinematic AI video, coherent characters and appearance, natural motion, expressive acting, detailed environment, good composition and smooth camera movement. This is not limited to animals: support fictional people, fictional children, animals, creatures, characters, objects, places, vehicles, fantasy scenes, comedy, action and storytelling.

Keep the scene family-friendly and visually clear. Do not add captions, logos, watermarks or text on screen unless the user explicitly asks for text.
Generate synchronized audio when supported: natural ambience, sound effects and appropriate character/environment sounds that match the action. If the prompt asks for speech, create appropriate spoken dialogue when supported.`;
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
      data.error?.message || data.error || data.message || `HTTP ${r.status}`
    );
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

    const id = data.id || data.request_id;

    if (!id) {
      throw new Error("A API não devolveu o ID da geração.");
    }

    for (let i = 0; i < 120; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));

      data = await api("/api/status/" + encodeURIComponent(id));

      const status = String(data.status || data.state || "").toLowerCase();
      setStatus(`Gerando vídeo com áudio... ${status || "processando"}`);

      if (["complete", "completed", "success", "succeeded"].includes(status)) {
        break;
      }

      if (["error", "failed", "canceled"].includes(status)) {
        throw new Error(
          data.error?.message || data.error || "A geração do vídeo falhou."
        );
      }
    }

    const url =
      data.downloads?.[0]?.url ||
      data.downloads?.[0] ||
      data.output?.media_url?.[0] ||
      data.output?.url ||
      data.output_url ||
      data.url;

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
