import { ApiResponse } from "@/types";
import { API_BASE_URL } from "@/lib/constants";

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "An error occurred",
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export const apiClient = {
  get: <T,>(endpoint: string) =>
    apiCall<T>(endpoint, { method: "GET" }),
  post: <T,>(endpoint: string, body: unknown) =>
    apiCall<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T,>(endpoint: string, body: unknown) =>
    apiCall<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T,>(endpoint: string) =>
    apiCall<T>(endpoint, { method: "DELETE" }),
};
