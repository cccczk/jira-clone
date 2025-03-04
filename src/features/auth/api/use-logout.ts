import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from '@/lib/rpc'
import { useRouter } from "next/navigation";
type ResponseType = InferResponseType<typeof client.api.auth.logout["$post"]>
export const useLogOut = () => {
    const router = useRouter()
    const queryClient = useQueryClient()
    const mutation = useMutation<
        ResponseType,
        Error
    >({
        mutationFn: async () => {
            const response = await client.api.auth.logout["$post"]()
            if (!response.ok) {
                throw new Error("Failed to logout")
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("sucess logout")
            router.refresh()
            queryClient.invalidateQueries({ queryKey: ["current"] })
        },
        onError: () => {
            toast.error("Failed to logout")
        }
    })
    return mutation
}