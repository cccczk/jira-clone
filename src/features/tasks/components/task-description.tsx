import { Button } from "@/components/ui/button";
import { Task } from "../types";
import { PencilIcon, XIcon } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { useState } from "react";
import { useUpdateTask } from "../api/use-update-task";
import { Textarea } from "@/components/ui/textarea";

interface TaskDescriptionProps {
    task: Task
}

export const TaskDescription = ({ task }: TaskDescriptionProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [value, setValue] = useState(task.description)

    const { mutate, isPending } = useUpdateTask()

    const handleSave = () => {
        mutate({
            json: { description: value },
            param: { taskId: task.$id }
        }, {
            onSuccess: () => {
                setIsEditing(false)
            }
        })
    }

    return (
        <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">任务描述</p>
                <Button onClick={() => setIsEditing((prev) => !prev)} size="sm" variant="secondary">
                    {isEditing ? (
                        <XIcon className="size-4 mr-2" />
                    ) : (
                        <PencilIcon className="size-4 mr-2" />
                    )}
                    {isEditing ? "取消" : "修改"}
                </Button>
            </div>
            <DottedSeparator className="my-4" />
            {isEditing ? (
                <div className="flex flex-col  gap-y-4">
                    <Textarea
                        placeholder="修改任务描述"
                        value={value}
                        rows={4}
                        onChange={(e) => setValue(e.target.value)}
                        disabled={isPending}
                    />
                    <Button
                        size="sm"
                        className="w-fit ml-auto"
                        onClick={handleSave}
                        disabled={isPending}
                    >
                        {isPending ? "保存中..." : "保存更改"}
                    </Button>
                </div>
            ) : (
                <div>
                    {task.description || (
                        <span>
                            这个任务还没有设置任务描述
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}