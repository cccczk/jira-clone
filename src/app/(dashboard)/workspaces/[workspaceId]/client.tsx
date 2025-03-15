"use client"

import { Analytics } from "@/components/analytics"
import { DottedSeparator } from "@/components/dotted-separator"
import { PageError } from "@/components/page-error"
import { PageLoader } from "@/components/page-loader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useGetMembers } from "@/features/members/api/use-get-members"
import { MemberAvatar } from "@/features/members/components/member-avatar"
import { Member } from "@/features/members/types"
import { useGetProjects } from "@/features/projects/api/use-get-projects"
import { ProjectAvatar } from "@/features/projects/components/project-avatar"
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal"
import { Project } from "@/features/projects/types"
import { useGetTasks } from "@/features/tasks/api/use-get-tasks"
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal"
import { Task } from "@/features/tasks/types"
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics"
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"
import { formatDistanceToNow } from "date-fns"
import { CalendarIcon, PlusIcon, SettingsIcon } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect } from "react"
import { toast } from "sonner"

export const WorkspaceIdClient = () => {
    const workspaceId = useWorkspaceId()
    const { open } = useCreateProjectModal()
    const { data: analytics, isLoading: isLoadingAnalytics } = useGetWorkspaceAnalytics({ workspaceId })
    const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId })
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId })
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId })
    const createProject = useCallback(() => {
        open();
    }, [open]);
    useEffect(() => {
        if (projects && projects.total === 0) {
            createProject();
        }
    }, [projects]);
    const isLoading =
        isLoadingAnalytics ||
        isLoadingMembers ||
        isLoadingProjects ||
        isLoadingTasks
    if (isLoading) {
        return <PageLoader />
    }
    if (!analytics || !tasks || !projects || !members) {
        return <PageError message="获取工作区数据失败" />
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            <Analytics data={analytics} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <TaskList data={tasks.documents} total={tasks.total} isProjectExist={projects.total === 0 ? false : true} />
                <ProjectList data={projects.documents} total={projects.total} />
                <MemberList data={members.documents} total={members.total} />
            </div>
        </div>
    )
}

interface TaskListProps {
    data: Task[],
    total: number,
    isProjectExist: boolean
}

export const TaskList = ({ data, total, isProjectExist }: TaskListProps) => {
    const workspaceId = useWorkspaceId()
    const { open: createProject } = useCreateProjectModal()
    const { open: createTask } = useCreateTaskModal()
    const createNewTask = () => {
        console.log(isProjectExist);
        if (isProjectExist) {
            createTask()
        } else {
            toast.warning("需要先创建项目后再创建任务", {
                className: "bg-blue-100",
                action: {
                    label: "去创建项目",
                    onClick: () => createProject(),
                },
            })
        }

    }
    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="txet-lg font-semibold">
                        任务数量: ({total})
                    </p>
                    <Button variant="muted" size="lg" onClick={createNewTask}>
                        <PlusIcon className="szie-4 text-neutral-400" />
                        创建一个新任务
                    </Button>
                </div>
                <DottedSeparator className="my-4" />
                <ul className="flex flex-col gap-y-4">
                    {data.map((task) => (
                        <li key={task.$id}>
                            <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                                <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                                    <CardContent className="p-4">
                                        <p className="text-lg font-medium truncate">{task.name}</p>
                                        <div className="flex items-center gap-x-2">
                                            <p className="">{task.project?.name}</p>
                                            <div className="size-1 rounded-full bg-neutral-300" />
                                            <div className="text-sm text-muted-foreground flex items-center">
                                                <CalendarIcon className="size-3 mr-1" />
                                                <span className="truncate">
                                                    {formatDistanceToNow(new Date(task.dueDate))}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                            <Button variant="muted" className="mt-4 w-full" asChild>
                                <Link href={`/workspaces/${workspaceId}/tasks`}>
                                    展示所有任务
                                </Link>
                            </Button>
                        </li>
                    ))}
                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        暂时没有任务
                    </li>
                </ul>
                
            </div>
        </div>
    )
}

interface ProjectListProps {
    data: Project[],
    total: number
}

export const ProjectList = ({ data, total }: ProjectListProps) => {
    const { open: createProject } = useCreateProjectModal()
    const workspaceId = useWorkspaceId()
    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="txet-lg font-semibold">
                        项目数量: ({total})
                    </p>
                    <Button variant="secondary" size="lg" onClick={createProject}>
                        <PlusIcon className="szie-4 text-neutral-400" />
                        创建一个新项目
                    </Button>
                </div>
                <DottedSeparator className="my-4" />
                <ul className="grid grid-flow-cols-1 lg:grid-cols-2 gap-4">
                    {data.map((project) => (
                        <li key={project.$id}>
                            <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                                <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                                    <CardContent className="p-4 flex items-center gap-x-2.5">
                                        <ProjectAvatar name={project.name} image={project.imageUrl} className="size-12" fallbackClassName="text-lg" />
                                        <p className="text-lg font-medium truncate">{project.name}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </li>
                    ))}
                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        暂时没有项目
                    </li>
                </ul>
            </div>
        </div>
    )
}

interface MemberListProps {
    data: Member[],
    total: number
}

export const MemberList = ({ data, total }: MemberListProps) => {
    const workspaceId = useWorkspaceId()
    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="txet-lg font-semibold">
                        成员数量: ({total})
                    </p>
                    <Button asChild variant="secondary" size="icon" >
                        <Link href={`/workspaces/${workspaceId}/members`}>
                            <SettingsIcon className="szie-4 text-neutral-400" />
                        </Link>

                    </Button>
                </div>
                <DottedSeparator className="my-4" />
                <ul className="grid grid-flow-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map((member) => (
                        <li key={member.$id}>
                            <Card className="shadow-none rounded-lg overflow-hidden">
                                <CardContent className="p-4 flex flex-col items-center gap-x-2">
                                    <MemberAvatar name={member.name} className="size-12" fallbackClassName="text-lg" />
                                    <div className="flex flex-col items-center overflow-hidden">
                                        <p className="text-lg font-medium line-clamp-1">{member.name}</p>
                                        <p className="text-lg text-muted-foreground line-clamp-1">{member.email}</p>
                                    </div>

                                </CardContent>
                            </Card>
                        </li>
                    ))}
                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        暂时没有成员
                    </li>
                </ul>
            </div>
        </div>
    )
}
