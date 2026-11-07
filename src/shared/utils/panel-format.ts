import { isAxiosError } from "axios";

export function hideTechnicalIds(text: string) {
  return text.replace(/\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/gi, "—");
}

export function errorMessage(error: unknown) {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    const detail = Array.isArray(message) ? message.join(" · ") : message;
    const text = detail ? hideTechnicalIds(detail) : undefined;
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
    ? hideTechnicalIds(error.message)
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

export function personName(
  person: { firstName: string; lastName: string | null } | null | undefined,
) {
  return person
    ? [person.firstName, person.lastName].filter(Boolean).join(" ")
    : "";
}
