/**
 * Core HTTP client service for APARICHIT frontend.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = "ApiError";
  }
}

export interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
    defaultHeaders["X-Session-Token"] = token;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Network connection failed";
    throw new ApiError(0, `Cannot connect to server at ${API_BASE_URL}: ${message}`);
  }

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    let parsedDetails: unknown = null;
    try {
      const errJson = await response.json();
      parsedDetails = errJson;
      if (typeof errJson.detail === "string") {
        errorDetail = errJson.detail;
      } else if (Array.isArray(errJson.detail)) {
        errorDetail = errJson.detail
          .map((d: { msg?: string }) => d.msg || JSON.stringify(d))
          .join("; ");
      }
    } catch {
      errorDetail = (await response.text()) || errorDetail;
    }
    throw new ApiError(response.status, errorDetail, parsedDetails);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
