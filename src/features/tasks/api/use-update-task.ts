import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from '@/lib/rpc'

type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$patch"], 200>
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$patch"]>

export const useUpdateTask = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.tasks[":taskId"]["$patch"]({ json, param })
            if (!response.ok) {
                throw new Error("Failed to Update Task")
            }
            return await response.json()
        },
        onSuccess: ({ data }) => {
            toast.success("Task Updated")

            queryClient.invalidateQueries({ queryKey: ["tasks"] })
            queryClient.invalidateQueries({ queryKey: ["task", data.$id] })
        },
        onError: () => {
            toast.error("Failed to Update Task")
        }
    })
    return mutation
}
// export const useCreateWorkspaces = () => {
//     const queryClient = useQueryClient();
//     const mutation = useMutation<ResponseType, Error, FormData>({
//         mutationFn: async (formData) => {
//             const response = await fetch("/api/workspaces", {
//                 method: "POST",
//                 body: formData, // ✅ 直接发送 `FormData`
//             });

//             if (!response.ok) {
//                 const errorText = await response.text();
//                 console.error("请求失败:", errorText);
//                 throw new Error(`Failed to create workspace: ${errorText}`);
//             }

//             return await response.json();
//         },
//         onSuccess: () => {
//             toast.success("Workspace created");
//             queryClient.invalidateQueries({ queryKey: ["workspaces"] });
//         },
//         onError: () => {
//             toast.error("Failed to create workspace");
//         },
//     });

//     return mutation;
// };
