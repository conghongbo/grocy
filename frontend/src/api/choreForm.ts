import { apiClient } from "./client";
import type { ChoreDraft } from "../domain/chores/choreForm";
export type ChoreUserfieldValues = Record<string, string | null>;
export const choreFormApi = {
  create: (draft: ChoreDraft) => apiClient.post<{ created_object_id: number }>("/api/objects/chores", draft),
  update: (id: number, draft: ChoreDraft) => apiClient.put<void>(`/api/objects/chores/${id}`, draft),
  userfields: (id: number) => apiClient.get<ChoreUserfieldValues>(`/api/userfields/chores/${id}`),
  saveUserfields: (id: number, values: ChoreUserfieldValues) => apiClient.put<void>(`/api/userfields/chores/${id}`, values),
  history: (id: number) => apiClient.get<Array<{ id: number }>>(`/api/objects/chores_log?limit=1&query[]=chore_id=${id}`),
  recalculate: (id: number) => apiClient.post<void>("/api/chores/executions/calculate-next-assignments", { chore_id: id }),
};
