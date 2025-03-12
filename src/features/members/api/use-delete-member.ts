import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from '@/lib/rpc'
type ResponseType = InferResponseType<typeof client.api.members[":memberId"]["$delete"],200>
type RequestType = InferRequestType<typeof client.api.members[":memberId"]["$delete"]>

export const useDeleteMember = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ param }) => {
            const response = await client.api.members[":memberId"]["$delete"]({ param })
            
            if (!response.ok) {
                throw new Error("Failed to Delete member")
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("member Deleted")
            queryClient.invalidateQueries({ queryKey: ["members"] })
        },
        onError: () => {
            toast.error("Failed to Delete member")
        }
    })
    return mutation
}
// export const useCreateWorkspaces = () => {
//     const queryClient = useQueryClient();
//     const mutation = useMutation<ResponseType, Error, FormData>({
//         mutationFn: async (formData) => {
//             const response = await fetch("/api/workspaces", {
//                 method: "delete",
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
