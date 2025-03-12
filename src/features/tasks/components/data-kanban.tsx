import React, { useCallback, useEffect, useState } from "react"

import { Task, TaskStatus } from "../types";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";

const boards: TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE
]
type TasksState = {
    [key in TaskStatus]: Task[]
}

interface DataKanbanProps {
    data: Task[]
    onChange: (tasks: { $id: string; status: TaskStatus; position:number}[]) =>void
}



export const DataKanban = ({ data, onChange }: DataKanbanProps) => {


    const [tasks, setTasks] = useState<TasksState>(() => {
        const initialTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: []
        }

        data.forEach((task) => {
            initialTasks[task.status].push(task)
        })

        Object.keys(initialTasks).forEach((status) => {
            initialTasks[status as TaskStatus].sort((a, b) => a.position - b.position)
        })
        return initialTasks

        
    })

    useEffect(() => {
        const newTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: []
        }
        data.forEach((task) => {
            newTasks[task.status].push(task)
        })

        Object.keys(newTasks).forEach((status) => {
            newTasks[status as TaskStatus].sort((a, b) => a.position - b.position)
        })

        setTasks(newTasks)
    },[data])

    const onDragEnd = useCallback((result: DropResult) => {
        // 如果用户把任务拖到了不能放置的地方，操作会被忽略
        if (!result.destination) return
        // drag操作的来源地和目的地
        const { source, destination } = result
        // 为任务来源地和目的地的状态名断言类型
        const sourceStatus = source.droppableId as TaskStatus
        const destinationStatus = destination.droppableId as TaskStatus
        // 声明一个数组用于存储需要更新的用户信息 在这里主要是声明类型 id用于获取到该任务 status用于存放更新后的status position用于确定该任务垂直拖拽后的优先级
        let updatesPayload: { $id: string, status: TaskStatus; position: number }[] = []
        // 调用useState中的setTasks更新拖拽后的所有任务
        setTasks((prevTasks) => {
            // 传入一开始的任务
            const newTasks = { ...prevTasks }
            // sourcecolumn接收来源列的status名字
            const sourceColumn = [...newTasks[sourceStatus]]
            // 从当前列删除一个任务 即移动的任务movedTask
            const [movedTask] = sourceColumn.splice(source.index, 1)

            if (!movedTask) {
                console.error("No task found at the source index")
                return prevTasks
            }
            // 更新移动的任务 如果来源状态不等于终点状态 则更新movedTask的status变为终点状态
            // 如果只是拖起来玩一下又放回去，那就不变
            const updatedMovedTask = sourceStatus !== destinationStatus
                ? { ...movedTask, status: destinationStatus }
                : movedTask
            // 更新来源列
            newTasks[sourceStatus] = sourceColumn
            // 更新目标列
            const destinationColumn = [...newTasks[destinationStatus]]
            destinationColumn.splice(destination.index, 0, updatedMovedTask)
            newTasks[destinationStatus] = destinationColumn
            // 更新的数据
            updatesPayload = []

            updatesPayload.push({
                $id: updatedMovedTask.$id,
                status: destinationStatus,
                position: Math.min((destination.index + 1) * 1000, 1_000_000)
            })
            // 更新目标列的位置 即垂直拖动或别的地方拖过来后进行排序
            newTasks[destinationStatus].forEach((task, index) => {
                if (task && task.$id !== updatedMovedTask.$id) {
                    const newPosition = Math.min((index + 1) * 1000, 1_000_000)
                    if (task.position !== newPosition) {
                        updatesPayload.push({
                            $id: task.$id,
                            status: destinationStatus,
                            position: newPosition
                        })
                    }
                }
            })
            // 如果发生有效拖动 重新给来源列排序
            if (sourceStatus !== destinationStatus) {
                newTasks[sourceStatus].forEach((task, index) => {
                    if (task) {
                        const newPosition = Math.min((index + 1) * 1000, 1_000_000)
                        if (task.position !== newPosition) {
                            updatesPayload.push({
                                $id: task.$id,
                                status: sourceStatus,
                                position: newPosition
                            })
                        }
                    }
                })
            }

            // 最后返回拖动后的所有任务
            return newTasks
        })

        onChange(updatesPayload)
    }, [onChange])

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto">
                {boards.map((board => {
                    return (
                        <div key={board} className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]">
                            <KanbanColumnHeader board={board} taskCount={tasks[board].length} />
                            <Droppable droppableId={board}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="min-h-[200px] py-1.5"
                                    >
                                        {tasks[board].map((task, index) => (
                                            <Draggable
                                                key={task.$id}
                                                draggableId={task.$id}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <KanbanCard task={task} />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    )
                }))}

            </div>
        </DragDropContext>
    )
}