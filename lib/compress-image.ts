/** Resize/compress a photo for avatar upload (keeps uploads under server limits). */
export async function compressAvatarFile(
  file: File,
  maxSizePx = 1024,
  quality = 0.82,
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSizePx / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  if (!blob) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "avatar";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}
