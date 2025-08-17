export async function saveSnap({ blob, caption, tags = [] }) {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 350));
  const id = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const image_url = URL.createObjectURL(blob);
  const created_at = new Date().toISOString();
  return { id, image_url, caption: caption || "", created_at, tags };
}

