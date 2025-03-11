import { useGetMembers } from "@/features/members/api/use-get-members"
import { useGetProjects } from "@/features/projects/api/use-get-projects"
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FolderIcon, ListChecksIcon, UserIcon } from "lucide-react"
import { TaskStatus } from "../types"
import { useTaskFilters } from "../hooks/use-task-filters"
import { DatePicker } from "@/components/date-picker"
interface DataFiltersProps {
    hideProjectFilter?: boolean

}

export const DataFilters = ({ hideProjectFilter }: DataFiltersProps) => {
    const workspaceId = useWorkspaceId()

    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId })
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId })

    const isLoading = isLoadingMembers || isLoadingProjects

    const projectOptions = projects?.documents.map((project) => ({
        value: project.$id,
        label: project.name,
    }))
    const memberOptions = members?.documents.map((member) => ({
        value: member.$id,
        label: member.name,
    }))

    const [{
        status,
        assigneeId,
        projectId,
        dueDate
    }, setFilters] = useTaskFilters()

    const onStatusChange = (value: string) => {
        setFilters({
            status: value === "all" ? null : value as TaskStatus
        });
    }
    const onAssigneeChange = (value: string) => {
        setFilters({
            assigneeId: value === "all" ? null : value as string
        });
    }
    const onProjectChange = (value: string) => {
        setFilters({
            projectId: value === "all" ? null : value as string
        });
    }

    if (isLoading) return null

    return (
        <div className="flex flex-col lg:flex-row gap-2">

            <Select
                defaultValue={status ?? undefined}
                onValueChange={(value) => { onStatusChange(value) }}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <ListChecksIcon className="size-4 mr-2" />
                        <SelectValue className="" placeholder="所有状态" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        所有状态
                    </SelectItem>
                    <SelectSeparator />
                    <SelectItem value={TaskStatus.BACKLOG}>
                        代办事项
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
            <Select
                defaultValue={assigneeId ?? undefined}
                onValueChange={(value) => { onAssigneeChange(value) }}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <UserIcon className="size-4 mr-2" />
                        <SelectValue className="" placeholder="所有负责人" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        所有负责人
                    </SelectItem>
                    <SelectSeparator />
                    {memberOptions?.map((member) => (
                        <SelectItem key={member.value} value={member.value}>
                            <div className="flex items-center gap-x-2">
                                {member.label}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {!hideProjectFilter && <Select
                defaultValue={projectId ?? undefined}
                onValueChange={(value) => { onProjectChange(value) }}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <FolderIcon className="size-4 mr-2" />
                        <SelectValue className="" placeholder="所有项目" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        所有项目
                    </SelectItem>
                    <SelectSeparator />
                    {projectOptions?.map((project) => (
                        <SelectItem key={project.value} value={project.value}>
                            <div className="flex items-center gap-x-2">
                                {project.label}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>}

            <DatePicker
                placeholder="截止日期"
                className="h-8 w-full lg:w-auto"
                value={dueDate ? new Date(dueDate) : undefined}
                onChange={(date) => {
                    setFilters({ dueDate: date ? date.toISOString() : null })
                }}
            />
        </div>
    )
}