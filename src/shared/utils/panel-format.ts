import { isAxiosError } from "axios";

export function errorMessage(error: unknown) {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    const text = Array.isArray(message) ? message.join(" · ") : message;
    if (status === 409)
      return `${text ?? "Conflicto con el estado actual."} Revisa los datos actualizados antes de volver a intentar.`;
    if (status === 403)
      return text ?? "Tu cuenta no tiene permiso para esta acción.";
    if (status === 404) return text ?? "El registro no está disponible.";
    if (status === 413) return "El archivo supera el tamaño permitido.";
    if (status === 429)
      return "Demasiadas solicitudes. Espera antes de volver a intentar.";
    if (status === 401)
      return text ?? "La sesión o las credenciales ya no son válidas.";
    return text ?? "No se pudo completar la solicitud a la API.";
  }
  return error instanceof Error
    ? error.message
    : "No se pudo completar la operación.";
}
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Lima",
  }).format(new Date(date));
