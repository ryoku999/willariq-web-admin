import imageCompressionWorkerUrl from "browser-image-compression/dist/browser-image-compression.js?url";

const mib = 1024 * 1024;
const sourceLimit = 30 * mib;
const uploadLimit = 5 * mib;
const compressionThreshold = 500 * 1024;
const extensions: Readonly<
  Partial<Record<string, { suffix: string; pattern: RegExp }>>
> = {
  "image/jpeg": { suffix: "jpg", pattern: /\.jpe?g$/i },
  "image/png": { suffix: "png", pattern: /\.png$/i },
  "image/webp": { suffix: "webp", pattern: /\.webp$/i },
};

export async function prepareEvidenceImage(file: File): Promise<File> {
  const extension = extensions[file.type];
  if (!extension) throw new Error("Selecciona una imagen JPEG, PNG o WebP.");
  if (file.size === 0) throw new Error("La imagen está vacía.");
  if (file.size > sourceLimit)
    throw new Error("La imagen original supera el límite de 30 MiB.");

  let optimized = file;
  if (file.size > compressionThreshold) {
    try {
      const { default: imageCompression } =
        await import("browser-image-compression");
      const candidate = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        initialQuality: 0.8,
        fileType: file.type,
        useWebWorker: true,
        libURL: new URL(imageCompressionWorkerUrl, window.location.href).href,
      });
      if (
        candidate.type === file.type &&
        candidate.size > 0 &&
        candidate.size < file.size
      ) {
        optimized = candidate;
      }
    } catch {
      if (file.size > uploadLimit) {
        throw new Error(
          "No se pudo optimizar la imagen. Selecciona una foto de hasta 5 MiB.",
        );
      }
    }
  }

  if (optimized.size > uploadLimit) {
    throw new Error(
      "La imagen supera el límite de 5 MiB después de optimizarla.",
    );
  }
  const name = extension.pattern.test(file.name)
    ? file.name
    : (file.name.replace(/\.[^.]+$/, "") || "evidencia") +
      "." +
      extension.suffix;
  return optimized === file && name === file.name
    ? file
    : new File([optimized], name, {
        type: file.type,
        lastModified: file.lastModified,
      });
}
