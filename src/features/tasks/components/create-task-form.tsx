"use client"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { createTaskSchema } from "../schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"
import { useCreateTask } from "../api/use-create-task"
import { DatePicker } from "@/components/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MemberAvatar } from "@/features/members/components/member-avatar"
import { TaskStatus } from "../types"
import { ProjectAvatar } from "@/features/projects/components/project-avatar"

interface CreateTaskFormProps {
    onCancel?: () => void
    projectOptions: { id: string, name: string, imageUrl: string }[]
    memberOptions: { id: string, name: string }[]
}


export const CreateTaskForm = ({ onCancel, projectOptions, memberOptions }: CreateTaskFormProps) => {
    const workspaceId = useWorkspaceId()

    const { mutate, isPending } = useCreateTask()

    const form = useForm<z.infer<typeof createTaskSchema>>({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            workspaceId
        }
    })


    const onSubmit = (values: z.infer<typeof createTaskSchema>) => {
        mutate({ json: { ...values, workspaceId } }, {
            onSuccess: () => {
                form.reset()
                onCancel?.()
                // router.push(`/workspaces/${data.workspaceId}/projects/${data.$id}`);
                // TODO Redirect to New task
            }
        })
    }
    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">
                    创建一个新任务
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
                                            任务名称
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="输入任务名称"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            截止日期
                                        </FormLabel>
                                        <FormControl>
                                            {/* date picker */}
                                            <DatePicker {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="assigneeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            负责人ID
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="选择负责人" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <FormMessage />
                                            <SelectContent >
                                                {memberOptions.map((member) => (
                                                    <SelectItem key={member.id} value={member.id}>
                                                        <div className="flex items-center gap-x-2">
                                                            <MemberAvatar className="size-6" name={member.name} />
                                                            {member.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            当前状态
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="选择状态" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <FormMessage />
                                            <SelectContent >
                                                <SelectItem value={TaskStatus.BACKLOG}>
                                                    待办事项
                                                </SelectItem>
                                                <SelectItem value={TaskStatus.TODO}>
                                                    即将开始
                                                </SelectItem>
                                                <SelectItem value={TaskStatus.IN_PROGRESS}>
                                                    正在进行
                                                </SelectItem>
                                                <SelectItem value={TaskStatus.IN_REVIEW}>
                                                    正在审核
                                                </SelectItem>
                                                <SelectItem value={TaskStatus.DONE}>
                                                    已完成
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            隶属项目
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="选择项目" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <FormMessage />
                                            <SelectContent >
                                                {projectOptions.map((project) => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        <div className="flex items-center gap-x-2">
                                                            <ProjectAvatar className="size-6" name={project.name} image={ project.imageUrl} />
                                                            {project.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <DottedSeparator className="py-7" />
                            <div className="flex items-center justify-between">
                                <Button type="button" size="lg" variant="secondary" onClick={onCancel} disabled={isPending} className={cn(!onCancel && "invisible")}>
                                    取消
                                </Button>
                                <Button type="submit" size="lg" variant="primary" disabled={isPending}>
                                    创建任务
                                </Button>
                            </div>

                        </div>

                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}