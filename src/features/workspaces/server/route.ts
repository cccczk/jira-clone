import { z } from 'zod'
import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator'
import { ID, Query } from 'node-appwrite';
import { createWorkspacesSchema, updateWorkspaceSchema } from '../schema';
import { sessionMiddleware } from '@/lib/session-middleware';
import { DATABASES_ID, IMAGES_BUCKET_ID, WORKSPACES_ID, MEMBERS_ID } from '@/config';
import { MemberRole } from '@/features/members/types';
import { generateInviteCode } from '@/lib/utils';
import { getMember } from '@/features/members/utils';
import { Workspace } from '../types';


// const app = new Hono()
//     .post(
//         "/",
//         zValidator("form", createWorkspacesSchema),
//         sessionMiddleware,
//         async (c) => {

//             const databases = c.get("databases")
//             const storage = c.get("storage")
//             const user = c.get("user")

//             const { name, image } = c.req.valid("form")

//             let uploadedImageUrl: string | undefined

//             if (image instanceof File) {
//                 const file = await storage.createFile(
//                     IMAGES_BUCKET_ID,
//                     ID.unique(),
//                     image
//                 )

//                 const arrayBuffer = await storage.getFilePreview(
//                     IMAGES_BUCKET_ID,
//                     file.$id
//                 )

//                 uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`
//             }
//             const workspace = await databases.createDocument(
//                 DATABASES_ID,
//                 WORKSPACES_ID,
//                 ID.unique(),
//                 {
//                     name,
//                     userId: user.$id,
//                     imageUrl: uploadedImageUrl,
//                 }
//             )

//             console.log(workspace);
//             return c.json({ data: workspace })
//         }
//     )

// export default app
const app = new Hono()
    .get("/", sessionMiddleware, async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");

        const members = await databases.listDocuments(
            DATABASES_ID,
            MEMBERS_ID,
            // 匹配登录的用户id
            [Query.equal("userId", user.$id)]
        )
        console.log(members, "members");
        // 这里已经确保了查询的是当前用户的数据
        if (members.total === 0) {
            return c.json({ data: { documents: [], total: 0 } })
        }

        const workspaceIds = members.documents.map((member) => member.workspaceId)
        console.log(workspaceIds, "workspaceIds");

        // 查询当前用户的工作区记录
        const workspaces = await databases.listDocuments(
            DATABASES_ID,
            WORKSPACES_ID,
            [
                Query.orderDesc("$createdAt"),
                Query.contains("$id", workspaceIds)
            ]
        )
        console.log(workspaces);
        return c.json({
            data: workspaces
        })
    })
    .post(
        "/",
        sessionMiddleware,
        async (c) => {
            try {
                const formData = await c.req.parseBody();
                console.log("解析后的 formData:", formData);
                if (!formData.name) {
                    return c.json({ error: "Name is required" }, 400);
                }

                const databases = c.get("databases");
                const storage = c.get("storage");
                const user = c.get("user");

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
                    console.log(stream);

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
                }

                const workspace = await databases.createDocument(
                    DATABASES_ID,
                    WORKSPACES_ID,
                    ID.unique(),
                    {
                        name: formData.name,
                        userId: user.$id,
                        imageUrl: uploadedImageUrl,
                        inviteCode: generateInviteCode(6)
                    }
                );

                console.log("创建的 workspace:", workspace);

                await databases.createDocument(
                    DATABASES_ID,
                    MEMBERS_ID,
                    ID.unique(),
                    {
                        userId: user.$id,
                        workspaceId: workspace.$id,
                        role: MemberRole.ADMIN
                    }
                )


                return c.json({ data: workspace });

            } catch (error) {
                console.error("服务器错误:", error);
                return c.json({ error: "Server error" }, 500);
            }
        }

    )
    .patch(
        "/:workspaceId",
        sessionMiddleware,
        zValidator("form", updateWorkspaceSchema),
        async (c) => {
            const databases = c.get("databases")
            const storage = c.get("storage");
            const user = c.get("user");
            const formData = await c.req.parseBody();

            const { workspaceId } = c.req.param()

            const { name, image } = c.req.valid("form")

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            })

            if (!member || member.role !== MemberRole.ADMIN) {
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

            const workspace = await databases.updateDocument(
                DATABASES_ID,
                WORKSPACES_ID,
                workspaceId,
                {
                    name,
                    imageUrl: uploadedImageUrl
                }
            )

            return c.json({ data: workspace })
        }
    )
    .delete(
        "/:workspaceId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases")
            const user = c.get("user")

            const { workspaceId } = c.req.param()
            console.log("route", workspaceId);

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member || member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            // todo: delete members projects and tasks

            await databases.deleteDocument(
                DATABASES_ID,
                WORKSPACES_ID,
                workspaceId
            )

            return c.json({ data: { $id: workspaceId } })
        }
    )
    .post(
        "/:workspaceId/reset-invite-code",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases")
            const user = c.get("user")

            const { workspaceId } = c.req.param()
            console.log("route", workspaceId);

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member || member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const workspace = await databases.updateDocument(
                DATABASES_ID,
                WORKSPACES_ID,
                workspaceId,
                {
                    inviteCode: generateInviteCode(6)
                }
            )

            return c.json({ data: workspace })
        }
    )
    .post(
        "/:workspaceId/join",
        sessionMiddleware,
        zValidator("json", z.object({ code: z.string() })),
        async (c) => {
            const { workspaceId } = c.req.param()
            const { code } = c.req.valid("json")

            const databases = c.get("databases")
            const user = c.get("user")

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (member) {
                return c.json({ error: "Already a member" }, 400)
            }

            const workspace = await databases.getDocument<Workspace>(
                DATABASES_ID,
                WORKSPACES_ID,
                workspaceId,
            )

            if (workspace.inviteCode !== code) {
                return c.json({ error: 'Invalid invite code' }, 400)
                
            }

            await databases.createDocument(
                DATABASES_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    workspaceId,
                    userId: user.$id,
                    role: MemberRole.MEMBER
                }
            )

            return c.json({ data: workspace })
        }
    )
export default app;

