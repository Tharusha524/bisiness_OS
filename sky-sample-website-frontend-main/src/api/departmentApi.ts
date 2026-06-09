import { z } from "zod";
import api from "../utils/api";

export const departmentSchema = z.object({
  id: z.string(),
  department: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type departmentSchema = z.infer<typeof departmentSchema>;

export async function fetchDepartmentData() {
  const res = await api.get("/departments");
  return res.data;
}

export async function createDepartment(department: string) {
  const res = await api.post("/departments", { department });
  return res.data;
}
