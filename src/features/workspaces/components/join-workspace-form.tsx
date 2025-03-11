"use client"

import { DottedSeparator } from "@/components/dotted-separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useJoinWorkspace } from "../api/use-join-workspace"
import { useInviteCode } from "../hooks/use-invite-code"
import { useWorkspaceId } from "../hooks/use-workspace-id"
import { useRouter } from "next/navigation"


interface JoinWorkspaceFormProps {
    initialValues: {
        name: string
    }
}

export const JoinWorkspaceForm = ({
    initialValues,
}: JoinWorkspaceFormProps) => {
    const router = useRouter()

    const workspaceId = useWorkspaceId()
    const inviteCode = useInviteCode()

    const { mutate, isPending } = useJoinWorkspace()

    const onSubmit = () => {
        console.log(inviteCode);
        
        mutate({
            param: { workspaceId },
            json: {code: inviteCode}
        }, {
            onSuccess: ({data}) => {
                router.push(`/workspaces/${data.$id}`)
            }
        })
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="p-7">
                <CardTitle className="text-xl font-bold">
                    加入工作区
                </CardTitle>
                <CardDescription>
                    你被邀请加入工作区 <strong>{initialValues.name}</strong>
                </CardDescription>
            </CardHeader>
            <div>
                <DottedSeparator />

            </div>
            <CardContent className="p-7">
                <div className="flex flex-col lg:flex-row gap-y-2 gap-x-2 items-center justify-between">
                    <Button
                        variant="secondary"
                        type="button"
                        size="lg"
                        className="w-full lg:w-fit"
                        disabled={isPending}
                    >
                        <Link href="/">
                            取消
                        </Link>
                    </Button>
                    <Button
                        onClick={onSubmit}
                        type="button"
                        size="lg"
                        className="w-full lg:w-fit"
                        disabled={isPending}
                    >
                        加入
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}