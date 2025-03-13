
import { z } from "zod"

export const createProjectSchema = z.object({
    name: z.string().min(1, "Required"),
    image: z.any().optional(), // ✅ 允许任何类型，手动解析
    workspaceId: z.string(),
});

export const updateProjectSchema = z.object({
    name: z.string().min(1, "最少需要一个字符").optional(),
    image: z.any().optional(), // ✅ 允许任何类型，手动解析
});