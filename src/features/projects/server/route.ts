import { z } from "zod";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { DATABASES_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { getMember } from "@/features/members/utils";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { Project } from "../types";
import {endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskStatus } from "@/features/tasks/types";

const app = new Hono()
    .post(
        '/',
        sessionMiddleware,
        zValidator("form", createProjectSchema),
        async (c) => {
            try {
                const databases = c.get("databases");
                const user = c.get("user");
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { name, image, workspaceId } = c.req.valid("form")
                const member = await getMember({
                    databases,
                    workspaceId,
                    userId: user.$id
                })

                if (!member) {
                    return c.json({ error: "Unathorized" }, 401);
                }


                let uploadedImageUrl: string | undefined;

                // if (formData.image instanceof File) {
                //     const file = await storage.createFile(
                //         IMAGES_BUCKET_ID,
                //         ID.unique(),
                //         formData.image
                //     )

                //     const arrayBuffer = await storage.getFilePreview(
                //         IMAGES_BUCKET_ID,
                //         file.$id
                //     )

                //     uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`

                // }

                // 无法解决nodejs无file问题 下方这段代码不会触发
                // if (globalThis.File && formData.image instanceof File) {
                //     console.log("上传的文件:", formData.image);

                //     // 读取文件内容
                //     const fileBuffer = await formData.image.arrayBuffer();
                //     const fileUint8Array = new Uint8Array(fileBuffer);

                //     // 将 Uint8Array 包装成 ReadableStream
                //     const stream = new ReadableStream<Uint8Array>({
                //         start(controller) {
                //             controller.enqueue(fileUint8Array);  // 将 Uint8Array 数据写入流
                //             controller.close();  // 流结束
                //         }
                //     });
                //     console.log(stream);

                //     // 上传文件到存储
                //     try {
                //         const file = await storage.createFile(
                //             IMAGES_BUCKET_ID,
                //             ID.unique(),
                //             { stream } // 使用创建的 stream
                //         );

                //         console.log("上传后的文件信息:", file); // 添加日志查看文件上传结果
                //         uploadedImageUrl = `https://cloud.appwrite.io/console/project-67b3334f0036ebec28e2/storage/bucket-67c6f0ee000b4681dff8/files/${file.$id}/view`;
                //     } catch (error) {
                //         console.error("文件上传失败:", error);
                //     }
                // }

                const project = await databases.createDocument(
                    DATABASES_ID,
                    PROJECTS_ID,
                    ID.unique(),
                    {
                        name,
                        imageUrl: uploadedImageUrl,
                        workspaceId
                    }
                );
                return c.json({ data: project });

            } catch (error) {
                console.error("服务器错误:", error);
                return c.json({ error: "Server error" }, 500);
            }
        }

    )
    .get(
        '/',
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            const databases = c.get('databases')
            const user = c.get("user")

            const { workspaceId } = c.req.valid("query")

            if (!workspaceId) {
                return c.json({ error: 'missing workspaceId' }, 400)
            }

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: 'Unauthorized' }, 401)
            }

            const projects = await databases.listDocuments<Project>(
                DATABASES_ID,
                PROJECTS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt")
                ]
            )

            return c.json({ data: projects })
        }
    )
    .get(
        '/:projectId',
        sessionMiddleware,
        async (c) => {
            const databases = c.get('databases')
            const user = c.get("user")
            const { projectId } = c.req.param()

            const project = await databases.getDocument<Project>(
                DATABASES_ID,
                PROJECTS_ID,
                projectId
            )

            const member = await getMember({
                databases,
                workspaceId: project.workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: 'Unauthorized' }, 401)
            }

            return c.json({ data: project })
        }
    )
    .patch(
        "/:projectId",
        sessionMiddleware,
        zValidator("form", updateProjectSchema),
        async (c) => {
            const databases = c.get("databases")
            const user = c.get("user");
            const formData = await c.req.parseBody();

            const { projectId } = c.req.param()

            const { name, image } = c.req.valid("form")

            const existingProject = await databases.getDocument<Project>(
                DATABASES_ID,
                PROJECTS_ID,
                projectId
            )

            const member = await getMember({
                databases,
                workspaceId: existingProject.workspaceId,
                userId: user.$id,
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            let uploadedImageUrl: string | undefined;
            // 无效 无法解决nodejs环境没有file的问题
            if (globalThis.File && formData.image instanceof File) {
                // console.log("上传的文件:", formData.image);

                // // 读取文件内容
                // const fileBuffer = await formData.image.arrayBuffer();
                // const fileUint8Array = new Uint8Array(fileBuffer);

                // // 将 Uint8Array 包装成 ReadableStream
                // const stream = new ReadableStream<Uint8Array>({
                //     start(controller) {
                //         controller.enqueue(fileUint8Array);  // 将 Uint8Array 数据写入流
                //         controller.close();  // 流结束
                //     }
                // });

                // // 上传文件到存储
                // try {
                //     const file = await storage.createFile(
                //         IMAGES_BUCKET_ID,
                //         ID.unique(),
                //         { stream } // 使用创建的 stream
                //     );

                //     console.log("上传后的文件信息:", file); // 添加日志查看文件上传结果
                //     uploadedImageUrl = `https://cloud.appwrite.io/console/project-67b3334f0036ebec28e2/storage/bucket-67c6f0ee000b4681dff8/files/${file.$id}/view`;
                // } catch (error) {
                //     console.error("文件上传失败:", error);
                // }
            } else {
                uploadedImageUrl = image
            }

            const project = await databases.updateDocument(
                DATABASES_ID,
                PROJECTS_ID,
                projectId,
                {
                    name,
                    imageUrl: uploadedImageUrl
                }
            )

            return c.json({ data: project })
        }
    )
    .delete(
        "/:projectId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases")
            const user = c.get("user")

            const { projectId } = c.req.param()

            const existingProject = await databases.getDocument<Project>(
                DATABASES_ID,
                PROJECTS_ID,
                projectId
            )
            const member = await getMember({
                databases,
                workspaceId: existingProject.workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            // todo: delete tasks

            await databases.deleteDocument(
                DATABASES_ID,
                PROJECTS_ID,
                projectId
            )

            return c.json({ data: { $id: existingProject.$id } })
        }
    )
    .get(
        "/:projectId/analytics",
        sessionMiddleware,
        async (c) => {
            const databases = c.get('databases')
            const user = c.get("user")
            const { projectId } = c.req.param()
            const project = await databases.getDocument<Project>(
                DATABASES_ID,
                PROJECTS_ID,
                projectId
            )
            const member = await getMember({
                databases,
                workspaceId: project.workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: 'Unauthorized' }, 401)
            }

            const now = new Date()
            const thisMonthStart = startOfMonth(now)
            const thisMonthEnd = endOfMonth(now)
            const lastMonthStart = startOfMonth(subMonths(now, 1))
            const lastMonthEnd = endOfMonth(subMonths(now, 1))
            // 统计任务总数
            const thisMonthTasks = await databases.listDocuments(
                DATABASES_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            )

            const lastMonthTasks = await databases.listDocuments(
                DATABASES_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            )
            const taskCount = thisMonthTasks.total
            const taskDifference = taskCount - lastMonthTasks.total
            // 统计负责人任务数量
            const thisMonthAssignedTasks = await databases.listDocuments(
                DATABASES_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            )
            const lastMonthAssignedTasks = await databases.listDocuments(
                DATABASES_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            )

            const assignedTaskCount = thisMonthAssignedTasks.total
            const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total
            // 统计未完成任务数量
            const thisMonthIncompleteTasks = await databases.listDocuments(
                DATABASES_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            )
            const lastMonthIncompleteTasks = await databases.listDocuments(
                DATABASES_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            )

            const incompleteTaskCount = thisMonthIncompleteTasks.total
            const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompleteTasks.total
            // 统计已完成任务数量
            const thisMonthCompletedTasks = await databases.listDocuments(
                DATABASES_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            )
            const lastMonthCompletedTasks = await databases.listDocuments(
                DATABASES_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            )

            const completedTaskCount = thisMonthCompletedTasks.total
            const completedTaskDifference = completedTaskCount - lastMonthCompletedTasks.total
            // 统计任务逾期数量
            const thisMonthOverdueTasks = await databases.listDocuments(
                DATABASES_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            )
            const lastMonthOverdueTasks = await databases.listDocuments(
                DATABASES_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            )

            const overdueTaskCount = thisMonthOverdueTasks.total
            const overdueTaskDifference = overdueTaskCount - lastMonthOverdueTasks.total

            return c.json({
                data: {
                    taskCount,
                    taskDifference,
                    assignedTaskCount,
                    assignedTaskDifference,
                    completedTaskCount,
                    completedTaskDifference,
                    incompleteTaskCount,
                    incompleteTaskDifference,
                    overdueTaskCount,
                    overdueTaskDifference
                }
            })
        }
    )

export default app
