export async function saveSnap({ blob, caption, tags, filter }) {
  await new Promise((r) => setTimeout(r, 250));
  return {
    id: (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`),
    image_url: URL.createObjectURL(blob),
    caption,
    tags,
    filter,
    created_at: new Date().toISOString(),
  };
}

export async function listSnaps(){
  return [];
}

