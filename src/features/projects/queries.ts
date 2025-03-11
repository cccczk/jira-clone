"use server"


import { Query } from "node-appwrite"

import { DATABASES_ID, PROJECTS_ID } from "@/config"
import { getMember } from "../members/utils"
import { Project } from "./types"
import { createSessionClient } from "@/lib/appwrite"

interface GetProjectProps {
    projectId: string
}

export const getProject = async ({ projectId }: GetProjectProps) => {

        const { databases, account } = await createSessionClient()

        const user = await account.get()

        const project = await databases.getDocument<Project>(
            DATABASES_ID,
            PROJECTS_ID,
            projectId
        )

        const member = await getMember({
            databases,
            userId: user.$id,
            workspaceId: project.workspaceId
        })
        if (!member) {
            throw new Error("Unauthorized")
        }
        // 查询当前用户的工作区记录
        
        return project
    

}