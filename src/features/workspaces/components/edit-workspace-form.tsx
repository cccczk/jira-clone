"use client"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRef } from "react"
import { useForm } from "react-hook-form"
import { updateWorkspaceSchema } from "../schema"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeftIcon, CopyIcon, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Workspace } from "../types"
import { useUpdateWorkspace } from "../api/use-update-workspaces"
import { useConfirm } from "@/hooks/use-confirm"
import { useDeleteWorkspace } from "../api/use-delete-workspace"
import { toast } from "sonner"
import { useResetInviteCode } from "../api/use-reset-invite-code"

interface EditWorkspaceFormProps {
    onCancel?: () => void
    initialValues: Workspace
}


export const EditWorkspaceForm = ({ onCancel, initialValues }: EditWorkspaceFormProps) => {
    const router = useRouter()

    const { mutate, isPending } = useUpdateWorkspace()
    const {
        mutate: deleteWorkspace,
        isPending: isDeletingWorkspace
    } = useDeleteWorkspace()
    const {
        mutate: resetInviteCode,
        isPending: isResettingInviteCode
    } = useResetInviteCode()

    const [DeleteDialog, confirmDelete] = useConfirm(
        "删除工作区",
        "这个操作是不可逆的",
        "destructive"
    )
    const [ResetDialog, confirmReset] = useConfirm(
        "重置邀请链接",
        "这将会使当前邀请链接失效",
        "destructive"
    )

    const inputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
        resolver: zodResolver(updateWorkspaceSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? ""
        }
    })

    const handleDelete = async () => {
        const ok = await confirmDelete()

        if (!ok) return

        console.log("deleting",initialValues.$id);
        deleteWorkspace({
            param: { workspaceId: initialValues.$id }
        }, {
            onSuccess() {
                window.location.href="/"
            },
        })
    }

    const handleResetInviteCode = async () => {
        const ok = await confirmReset()

        if (!ok) return

        console.log("Reseting", initialValues.$id);
        resetInviteCode({
            param: { workspaceId: initialValues.$id }
        })
    }

    const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : ""
        }
        console.log("edit formdata", form);

        mutate({
            form: finalValues,
            param: { workspaceId: initialValues.$id }
        }, {
            onSuccess: () => {
                form.reset()
            }
        })
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            form.setValue("image", file)
        }
    }


    const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`

    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(fullInviteLink)
            .then(()=> toast.success("复制成功"))
    }

    return (
        <div className="flex flex-col gap-y-4">
            <DeleteDialog />
            <ResetDialog />
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center gap-x-4 space-y-0">
                    <Button size="sm" variant="secondary" onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.$id}`)}>
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back
                    </Button>
                    <CardTitle className="text-xl font-bold">
                        {initialValues.name}
                    </CardTitle>
                </CardHeader>
                <div className="px-7">
                    <DottedSeparator />
                </div>
                <CardContent className="p-7">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Workspace Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="输入工作区名称"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <div className="felx flex-col gap-y-2">
                                            <div className="flex items-center gap-x-5">
                                                {field.value ? (
                                                    <div className="size-[72px] relative rounded-md overflow-hidden">
                                                        <Image
                                                            src={
                                                                field.value instanceof File
                                                                    ? URL.createObjectURL(field.value)
                                                                    : field.value
                                                            }
                                                            alt="Logo"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <Avatar className="size-[72px]">
                                                        <AvatarFallback>
                                                            <ImageIcon className="size-[36px] text-neutral-400" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="flex flex-col ">
                                                    <p className="text-sm">Workspace Icon</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        JPG, PNG, SVG or JPEG, max 1MB
                                                    </p>
                                                    <input className="hidden" accept=".jpg, .png, .jpeg, .svg" type="file" ref={inputRef} disabled={isPending} onChange={handleImageChange} />
                                                    <Button type="button" disabled={isPending} variant="teritary" size="xs" className="w-fit mt-2" onClick={() => inputRef.current?.click()}>
                                                        Upload Image
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />
                                <DottedSeparator className="py-7" />
                                <div className="flex items-center justify-between">
                                    <Button type="button" size="lg" variant="secondary" onClick={onCancel} disabled={isPending} className={cn(!onCancel && "invisible")}>
                                        取消
                                    </Button>
                                    <Button type="submit" size="lg" variant="primary" disabled={isPending}>
                                        保存更改
                                    </Button>
                                </div>

                            </div>

                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-4">
                    <div className="flex flex-col">
                        <h3 className="font-bold">
                            邀请新的工作区成员
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            通过邀请链接添加新成员到工作区中
                        </p>
                        <div className="mt-4">
                            <div className="flex items-center gap-x-2">
                                <Input disabled value={fullInviteLink} />
                                <Button
                                    onClick={handleCopyInviteLink}
                                    variant="secondary"
                                    className="size-12"
                                >
                                    <CopyIcon className="size-5"  />
                                </Button>
                            </div>
                        </div>
                        <DottedSeparator className="py-7" />
                        <Button
                            className="mt-6 w-fit ml-auto"
                            size="sm"
                            variant="destructive"
                            type="button"
                            disabled={isPending || isResettingInviteCode}
                            onClick={handleResetInviteCode}
                        >
                            重置邀请链接
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-4">
                    <div className="flex flex-col">
                        <h3 className="font-bold">
                            警告
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            删除工作区是不可逆的且会同时删除所有关联的数据
                        </p>
                        <DottedSeparator className="py-7" />
                        <Button
                            className="mt-6 w-fit ml-auto"
                            size="sm"
                            variant="destructive"
                            type="button"
                            disabled={isPending || isDeletingWorkspace}
                            onClick={handleDelete}
                        >
                            删除工作区
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

    )
}