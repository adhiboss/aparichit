/**
 * Moderation reporting service.
 */

import { apiRequest } from "./api.ts";
import type { CreateReportRequest, ReportResponse } from "./types.ts";

/**
 * Submit a moderation report against a post or reply.
 */
export async function submitReport(
  payload: CreateReportRequest,
  token?: string
): Promise<ReportResponse> {
  return apiRequest<ReportResponse>("/reports", {
    method: "POST",
    token,
    body: JSON.stringify({
      target_type: payload.target_type,
      target_id: payload.target_id,
      reason: payload.reason,
      session_token: token,
    }),
  });
}
