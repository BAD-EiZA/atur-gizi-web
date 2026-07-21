export type UploadSignature = {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  folder: string;
  public_id_prefix?: string;
  delivery_type: string;
  signature: string;
  mock?: boolean;
};

export type CloudinaryUploadResult = {
  public_id: string;
  version?: number | string;
  format?: string;
  bytes?: number;
  resource_type?: string;
  type?: string;
  secure_url?: string;
  width?: number;
  height?: number;
};

const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export function validateFoodImage(file: File) {
  if (!ALLOWED.has(file.type) && !file.name.match(/\.(jpe?g|png|webp|heic|heif)$/i)) {
    throw new Error("Format gambar tidak didukung. Gunakan JPEG, PNG, atau WebP.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Ukuran gambar maksimal 50 MB.");
  }
}

export async function uploadToCloudinary(
  file: File,
  sig: UploadSignature,
): Promise<CloudinaryUploadResult> {
  validateFoodImage(file);

  if (sig.mock) {
    return {
      public_id: `${sig.folder}/mock_${Date.now()}`,
      format: file.type.split("/")[1] || "jpeg",
      bytes: file.size,
      type: sig.delivery_type,
    };
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.api_key);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);
  form.append("type", sig.delivery_type || "authenticated");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`, {
    method: "POST",
    body: form,
  });

  const body = (await res.json()) as CloudinaryUploadResult & { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(body.error?.message || "Upload Cloudinary gagal.");
  }
  if (!body.public_id) {
    throw new Error("Upload Cloudinary tidak mengembalikan public_id.");
  }
  return body;
}

export async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
