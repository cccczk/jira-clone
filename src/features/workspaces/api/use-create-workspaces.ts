import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from '@/lib/rpc'
type ResponseType = InferResponseType<typeof client.api.workspaces["$post"],200>
type RequestType = InferRequestType<typeof client.api.workspaces["$post"]>

export const useCreateWorkspaces = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ( form ) => {
            const response = await client.api.workspaces["$post"]( form )
            console.log(form);
            
            if (!response.ok) {
                throw new Error("Failed to create workspace")
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("workspace created")
            queryClient.invalidateQueries({ queryKey: ["workspaces"] })
        },
        onError: () => {
            toast.error("Failed to create workspace")
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
