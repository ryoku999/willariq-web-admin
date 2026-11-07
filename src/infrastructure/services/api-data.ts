import http from "@/config/http/axios";
import type { ApiEnvelope } from "@/shared/interfaces/api-response.interface";

export async function apiData<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  url: string,
  options: { params?: object; data?: unknown } = {},
) {
  const response = await http.request<ApiEnvelope<T>>({
    method,
    url,
    ...options,
  });
  return response.data.data;
}

export async function apiBlob(url: string) {
  return (await http.get<Blob>(url, { responseType: "blob" })).data;
}
