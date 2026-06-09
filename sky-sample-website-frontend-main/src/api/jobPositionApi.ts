import { z } from "zod";
import api from "../utils/api";

export const jobPositionSchema = z.object({
  id: z.string(),
  jobPosition: z.string(),
});

export type jobPositionSchema = z.infer<typeof jobPositionSchema>;

export async function fetchJobPositionData() {
    const res = await api.get("/job-positions");
    return res.data;
}

export async function createJobPosition(jobPosition: string) {
    const res = await api.post("/job-positions", { jobPosition });
    return res.data;
}