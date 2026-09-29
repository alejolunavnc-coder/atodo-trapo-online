import crypto from "crypto";

export type ManagedImage = {
  publicId: string;
  version: number;
  format?: string;
  width?: number;
  height?: number;
  createdAt?: string;
};

export type ImageRegistry = {
  schema: 1;
  revision: number;
  updatedAt: string;
  products: Record<string, ManagedImage>;
  variants: Record<string, ManagedImage>;
};

const REGISTRY_PUBLIC_ID = "atodo-trapo/config/image-registry.json";

export function emptyRegistry(): ImageRegistry {
  return { schema: 1, revision: 0, updatedAt: new Date(0).toISOString(), products: {}, variants: {} };
}

function cloudConfig() {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const key = process.env.CLOUDINARY_API_KEY || "";
  const secret = process.env.CLOUDINARY_API_SECRET || "";
  if (!cloud || !key || !secret) throw new Error("Falta configurar Cloudinary");
  return { cloud, key, secret };
}

function sign(params: Record<string, string | number>, secret: string) {
  const base = Object.entries(params)
    .filter(([, v]) => v !== "" && v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return crypto.createHash("sha1").update(`${base}${secret}`).digest("hex");
}

export function deliveryUrl(image: ManagedImage, mode: "card" | "detail" = "card") {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "equm866o";
  const transform = mode === "detail" ? "f_auto,q_auto,c_limit,w_1100" : "f_auto,q_auto,c_limit,w_500";
  return `https://res.cloudinary.com/${cloud}/image/upload/${transform}/v${image.version}/${image.publicId}`;
}

async function fetchRegistryDirect(): Promise<ImageRegistry | null> {
  const { cloud } = cloudConfig();
  const url = `https://res.cloudinary.com/${cloud}/raw/upload/${REGISTRY_PUBLIC_ID}.json?t=${Date.now()}`;
  const r = await fetch(url, { cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) return null;
  const json = await r.json();
  if (!json || json.schema !== 1) return null;
  return json as ImageRegistry;
}

async function fetchRegistryAdmin(): Promise<ImageRegistry | null> {
  const { cloud, key, secret } = cloudConfig();
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const encoded = encodeURIComponent(REGISTRY_PUBLIC_ID);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/resources/raw/upload/${encoded}`, {
    headers: { Authorization: `Basic ${auth}` }, cache: "no-store",
  });
  if (r.status === 404) return null;
  if (!r.ok) return null;
  const meta = await r.json();
  if (!meta.secure_url) return null;
  const data = await fetch(`${meta.secure_url}?t=${Date.now()}`, { cache: "no-store" });
  if (!data.ok) return null;
  return (await data.json()) as ImageRegistry;
}

export async function readRegistry(): Promise<ImageRegistry> {
  try {
    return (await fetchRegistryDirect()) || (await fetchRegistryAdmin()) || emptyRegistry();
  } catch {
    return emptyRegistry();
  }
}

export async function writeRegistry(registry: ImageRegistry): Promise<ImageRegistry> {
  const { cloud, key, secret } = cloudConfig();
  const next: ImageRegistry = {
    ...registry,
    schema: 1,
    revision: (registry.revision || 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { overwrite: "true", public_id: REGISTRY_PUBLIC_ID, timestamp };
  const fd = new FormData();
  fd.set("file", new Blob([JSON.stringify(next)], { type: "application/json" }), "image-registry.json");
  fd.set("api_key", key);
  fd.set("timestamp", String(timestamp));
  fd.set("public_id", REGISTRY_PUBLIC_ID);
  fd.set("overwrite", "true");
  fd.set("signature", sign(params, secret));
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/raw/upload`, { method: "POST", body: fd });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || "No se pudo guardar el registro de imágenes");
  return next;
}

export async function uploadManagedImage(file: File): Promise<ManagedImage> {
  const { cloud, key, secret } = cloudConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const random = crypto.randomBytes(12).toString("hex");
  const publicId = `atodo-trapo/assets/${Date.now()}-${random}`;
  const params = { public_id: publicId, timestamp };
  const fd = new FormData();
  fd.set("file", file); fd.set("api_key", key); fd.set("timestamp", String(timestamp));
  fd.set("public_id", publicId); fd.set("signature", sign(params, secret));
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: fd });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || "No se pudo subir la imagen");
  return { publicId: j.public_id, version: j.version, format: j.format, width: j.width, height: j.height, createdAt: j.created_at };
}

export async function destroyManagedImage(publicId: string) {
  if (!publicId.startsWith("atodo-trapo/assets/")) return;
  const { cloud, key, secret } = cloudConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { invalidate: "true", public_id: publicId, timestamp };
  const body = new URLSearchParams({ public_id: publicId, timestamp: String(timestamp), invalidate: "true", api_key: key, signature: sign(params, secret) });
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/destroy`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || (j?.result !== "ok" && j?.result !== "not found")) {
    throw new Error(j?.error?.message || "No se pudo eliminar la imagen de Cloudinary");
  }
}

export function isReferenced(registry: ImageRegistry, publicId: string) {
  return [...Object.values(registry.products), ...Object.values(registry.variants)].some(x => x.publicId === publicId);
}
