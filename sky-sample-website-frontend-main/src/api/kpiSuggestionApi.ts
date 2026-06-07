import api from "../utils/api";

export interface KpiSuggestion {
  title: string;
  desc: string;
  impact: string;
  impactType: "high" | "medium";
}

export async function getKpiAiSuggestions(metricId: number): Promise<KpiSuggestion[]> {
  const res = await api.get(`/metrics/${metricId}/ai-suggestions`);
  return res.data;
}
