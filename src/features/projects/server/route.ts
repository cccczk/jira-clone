import { z } from "zod";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createAdminClient } from "@/lib/appwrite";
import { DATABASES_ID, IMAGES_BUCKET_ID, MEMBERS_ID, PROJECTS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { getMember } from "@/features/members/utils";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { Project } from "../types";
import { MemberRole } from "@/features/members/types";

const app = new Hono()
    .post(
        '/',
        sessionMiddleware,
        zValidator("form", createProjectSchema),
        async (c) => {
            try {
                const databases = c.get("databases");
                const storage = c.get("storage");
                const user = c.get("user");
                const { name, image, workspaceId } = c.req.valid("form")
                // const formData = await c.req.parseBody();
                // console.log("解析后的 formData:", formData);
                // if (!formData.name) {
                //     return c.json({ error: "Name is required" }, 400);
                // }

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

            const projects = await databases.listDocuments(
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
    .patch(
        "/:projectId",
        sessionMiddleware,
        zValidator("form", updateProjectSchema),
        async (c) => {
            const databases = c.get("databases")
            const storage = c.get("storage");
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
                console.log("上传的文件:", formData.image);

                // 读取文件内容
                const fileBuffer = await formData.image.arrayBuffer();
                const fileUint8Array = new Uint8Array(fileBuffer);

                // 将 Uint8Array 包装成 ReadableStream
                const stream = new ReadableStream<Uint8Array>({
                    start(controller) {
                        controller.enqueue(fileUint8Array);  // 将 Uint8Array 数据写入流
                        controller.close();  // 流结束
                    }
                });

                // 上传文件到存储
                try {
                    const file = await storage.createFile(
                        IMAGES_BUCKET_ID,
                        ID.unique(),
                        { stream } // 使用创建的 stream
                    );

                    console.log("上传后的文件信息:", file); // 添加日志查看文件上传结果
                    uploadedImageUrl = `https://cloud.appwrite.io/console/project-67b3334f0036ebec28e2/storage/bucket-67c6f0ee000b4681dff8/files/${file.$id}/view`;
                } catch (error) {
                    console.error("文件上传失败:", error);
                }
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

export default app
