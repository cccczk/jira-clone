
import { z } from "zod"

// export const createWorkspacesSchema = z.object({
//     name: z.string().trim().min(1, "Required"),
//     image: z.union([
//         z.instanceof(File),
//         z.string().transform((value) => value === "" ? undefined : value),
//     ])
//     .optional()
        
// })
// console.log("schema");

// export const createWorkspacesSchema = z.object({
//     name: z.string().trim().min(1, "Required"),
//     image: z
//         .union([
//             z.custom<File>((val) => typeof File !== "undefined" && val instanceof File),
//             z.string().transform((value) => (value === "" ? undefined : value)),
//         ])
//         .optional(),
// });

export const createWorkspacesSchema = z.object({
    name: z.string().min(1, "Required"),
    image: z.any().optional(), // ✅ 允许任何类型，手动解析
});
