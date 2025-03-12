"use client"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRef } from "react"
import { useForm } from "react-hook-form"
import { createWorkspacesSchema } from "../schema"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCreateWorkspaces } from "../api/use-create-workspaces"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface CreateWorkspaceFormProps {
    onCancel?: () => void
}


export const CreateWorkspaceForm = ({ onCancel }: CreateWorkspaceFormProps) => {
    const router = useRouter()

    const { mutate, isPending } = useCreateWorkspaces()

    const inputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof createWorkspacesSchema>>({
        resolver: zodResolver(createWorkspacesSchema),
        defaultValues: {
            name: "",
            image: undefined,
        }
    })
    // const onSubmit = (values: z.infer<typeof createWorkspacesSchema>) => {
    //     const formData = new FormData();

    //     console.log("原始 values:", values); // 检查 values 是否正确

    //     if (values.name) {
    //         formData.append("name", values.name);
    //     } else {
    //         console.warn("⚠️ name 为空");
    //     }

    //     if (values.image instanceof File) {
    //         formData.append("image", values.image);
    //     } else {
    //         console.warn("⚠️ image 为空或不是 File 类型:", values.image);
    //     }

    //     console.log("最终 formData 内容:", [...formData.entries()]); // 打印 formData 的内容

    //     mutate(formData, {
    //         onSuccess: ({data}) => {
    //             form.reset()
    //             // onCancel?.()
    //             router.push(`/workspaces/${data.$id}`)
    //         }
    //     });
    // };



    const onSubmit = (values: z.infer<typeof createWorkspacesSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : ""
        }
        mutate({ form: finalValues }, {
            onSuccess: ({ data }) => {
                form.reset()
                // onCancel?.()
                router.push(`/workspaces/${data.$id}`)
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
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">
                    Create a new workspace
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
                                            Workspace
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
                                    创建工作区
                                </Button>
                            </div>

                        </div>

                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}