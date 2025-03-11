"use client"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRef } from "react"
import { useForm } from "react-hook-form"
import { updateProjectSchema } from "../schema"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeftIcon, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Project } from "../types"
import { useConfirm } from "@/hooks/use-confirm"
import { toast } from "sonner"
import { useUpdateProject } from "../api/use-update-project"
import { useDeleteProject } from "../api/use-delete-project"


interface EditProjectFormProps {
    onCancel?: () => void
    initialValues: Project
}


export const EditProjectForm = ({ onCancel, initialValues }: EditProjectFormProps) => {
    const router = useRouter()

    const { mutate, isPending } = useUpdateProject()
    const {
        mutate: deleteProject,
        isPending: isDeletingWorkspace
    } = useDeleteProject()


    const [DeleteDialog, confirmDelete] = useConfirm(
        "删除项目",
        "这个操作是不可逆的",
        "destructive"
    )

    const inputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof updateProjectSchema>>({
        resolver: zodResolver(updateProjectSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? ""
        }
    })

    const handleDelete = async () => {
        const ok = await confirmDelete()

        if (!ok) return

        console.log("deleting",initialValues.$id);
        deleteProject({
            param: { projectId: initialValues.$id }
        }, {
            onSuccess() {
                window.location.href=`/workspaces/${initialValues.workspaceId}`
            },
        })
    }

    const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : ""
        }
        console.log("edit formdata", form);

        mutate({
            form: finalValues,
            param: { projectId: initialValues.$id }
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
    return (
        <div className="flex flex-col gap-y-4">
            <DeleteDialog />
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center gap-x-4 space-y-0">
                    <Button size="sm" variant="secondary" onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`)}>
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
                                                项目名称
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="输入项目名称"
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
                                                    <p className="text-sm">Project Icon</p>
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
                            警告
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            删除项目是不可逆的且会同时删除所有关联的数据
                        </p>
                        <DottedSeparator className="py-7" />
                        <Button
                            className="mt-6 w-fit ml-auto"
                            size="sm"
                            variant="destructive"
                            type="button"
                            disabled={isPending}
                            onClick={handleDelete}
                        >
                            删除项目
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

    )
}