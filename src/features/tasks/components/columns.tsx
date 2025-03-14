"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Task } from "../types"
import { ArrowUpDown, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectAvatar } from "@/features/projects/components/project-avatar"
import { MemberAvatar } from "@/features/members/components/member-avatar"
import { TaskDate } from "./task-date"
import { Badge } from "@/components/ui/badge"
import { toCnStatus } from "@/lib/utils"
import { TaskActions } from "./task-actions"
export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    任务名称
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const name = row.original.name

            return <p className="line-clamp-1">{name}</p>
        },

    },
    {
        accessorKey: "project",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    项目名称
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const project = row.original.project

            return (
                <div className="flex items-center gap-x-2 text-sm font-medium">
                    <ProjectAvatar name={project.name} className="size-6" image={project.imageUrl} />
                    <p className="line-clamp-1">{project.name}</p>
                </div>
            )
        },
    },
    {
        accessorKey: "assignee",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    负责人
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const assignee = row.original.assignee

            return (
                <div className="flex items-center gap-x-2 text-sm font-medium">
                    <MemberAvatar name={assignee.name} fallbackClassName="text-xs" className="size-6" />
                    <p className="line-clamp-1">{assignee.name}</p>
                </div>
            )
        },
    }, {
        accessorKey: "dueDate",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    截止日期
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const dueDate = row.original.dueDate

            return (
                <TaskDate value={dueDate} />
            )
        },
    }, {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    状态
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.original.status
            
            return (
                <Badge variant={status}>
                    {toCnStatus[status]}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const id = row.original.$id

            const projectId = row.original.projectId

            return (
                <TaskActions id={id} projectId={projectId} >
                    <Button variant="ghost" className="size-8 p-0">
                        <MoreVertical className="size-4"/>
                    </Button>
                </TaskActions>
            )
        }
    }
]