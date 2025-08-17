// lib/exportPolaroid.js
import { toPng } from "html-to-image";

async function imgToDataURL(src) {
  const res = await fetch(src, { mode: "cors", cache: "no-cache" });
  const blob = await res.blob();
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function waitForImages(root) {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) =>
      img.decode
        ? img.decode().catch(() => {})
        : new Promise((res) => (img.complete ? res() : img.addEventListener("load", res, { once: true })))
    )
  );
}

// Convert any <img src="blob:..."> or remote to dataURL temporarily.
// Returns a cleanup fn to restore original src values.
async function inlineImgs(root) {
  const imgs = Array.from(root.querySelectorAll("img"));
  const restore = [];

  for (const img of imgs) {
    const orig = img.getAttribute("src");
    if (!orig) continue;
    if (orig.startsWith("data:")) continue;
    try {
      const dataUrl = await imgToDataURL(orig);
      img.setAttribute("src", dataUrl);
      restore.push(() => img.setAttribute("src", orig));
    } catch (e) {
      restore.push(() => img.setAttribute("src", orig));
    }
  }

  return () => restore.forEach((fn) => fn());
}

export async function exportNodeAsPng(node, filename = "polaroid.png", hideSelectors = []) {
  if (!node) return;

  await waitForImages(node);

  // Hide elements via display to avoid layout footprint
  const hidden = [];
  hideSelectors.forEach((sel) => {
    node.querySelectorAll(sel).forEach((el) => {
      hidden.push([el, el.style.display]);
      el.style.display = "none";
    });
  });

  const restoreImgs = await inlineImgs(node);

  // Neutralize transforms and compute integer size
  const prevTransform = node.style.transform;
  node.style.transform = "none";
  const rect = node.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);

  try {
    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      width,
      height,
      style: { width: `${width}px`, height: `${height}px`, transform: "none" },
      cacheBust: true,
      backgroundColor: null,
      imagePlaceholder:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP4BwQACgABzSZp1gAAAABJRU5ErkJggg==",
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename || "polaroid.png";
    a.click();
  } finally {
    node.style.transform = prevTransform;
    restoreImgs();
    hidden.forEach(([el, prev]) => (el.style.display = prev));
  }
}


