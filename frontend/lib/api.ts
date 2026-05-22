export type Severity = "critical" | "high" | "medium";
export type IncidentStatus = "open" | "analyzing" | "resolved";

export interface IncidentPayload {
  dynatrace_anomaly: string;
  service_name: string;
  pasted_logs?: string;
  gitlab_repo?: string;
}

export interface AnalysisResult {
  issue_category: string;
  confidence_score: number;
  root_cause: string;
  suspicious_commit: string;
  beginner_explanation: string;
  suggested_patch: string;
  next_steps: string[];
}

export interface IncidentRecord {
  id: string;
  service_name: string;
  severity: Severity;
  status: IncidentStatus;
  created_at: string;
  analysis?: AnalysisResult;
  dynatrace_anomaly?: string;
  logs?: string;
}

export interface StatsResponse {
  avg_mttr_before: number;
  avg_mttr_after: number;
  total_incidents: number;
  resolved_count: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function getIncidents(): Promise<IncidentRecord[]> {
  const response = await fetch(`${BASE_URL}/api/incidents`, { cache: "no-store" });
  return handleResponse<IncidentRecord[]>(response);
}

export async function getIncident(id: string): Promise<IncidentRecord> {
  const response = await fetch(`${BASE_URL}/api/incidents/${id}`, { cache: "no-store" });
  return handleResponse<IncidentRecord>(response);
}

export async function analyzeIncident(payload: IncidentPayload): Promise<AnalysisResult> {
  const response = await fetch(`${BASE_URL}/api/analyze-incident`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<AnalysisResult>(response);
}

export async function resolveIncident(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/incidents/${id}/resolve`, {
    method: "POST",
  });
  await handleResponse<{ status: string }>(response);
}

export async function getStats(): Promise<StatsResponse> {
  const response = await fetch(`${BASE_URL}/api/stats`, { cache: "no-store" });
  return handleResponse<StatsResponse>(response);
}
