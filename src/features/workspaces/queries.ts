"use server"

import { Query } from "node-appwrite"
import { DATABASES_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config"
import { createSessionClient } from "@/lib/appwrite"

export const getWorkspaces = async () => {


    const { databases, account } = await createSessionClient()
    const user = await account.get()
    const members = await databases.listDocuments(
        DATABASES_ID,
        MEMBERS_ID,
        // 匹配登录的用户id
        [Query.equal("userId", user.$id)]
    )
    // 这里已经确保了查询的是当前用户的数据
    if (members.total === 0) {
        return { documents: [], total: 0 }
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId)

    // 查询当前用户的工作区记录
    const workspaces = await databases.listDocuments(
        DATABASES_ID,
        WORKSPACES_ID,
        [
            Query.orderDesc("$createdAt"),
            Query.contains("$id", workspaceIds)
        ]
    )
    return workspaces

}
