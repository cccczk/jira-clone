"use client"
import { UserButton } from "@/features/auth/components/user-button"
import { MobileSidebar } from "./mobile-sidebar"
import { usePathname } from "next/navigation"

const pathnameMap = {
    "tasks": {
        title: "我的任务",
        description: "在这里查看你的所有任务"
    },
    "projects": {
        title: "我的项目",
        description: "在这里查看你该项目下的所有任务"
    },
}

const defaultMap = {
    title: "主页",
    description: "在这里监控你的所有项目和任务"
}
export const Navbar = () => {
    const pathname = usePathname()
    const pathnameParts = pathname.split("/")
    const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap

    const { title, description } = pathnameMap[pathnameKey] || defaultMap

    return (
        <nav className="pt-4 px-6 flex items-center justify-between">
            <div className="flex-col hidden lg:flex">
                <h1 className="text-2xl font-semibold">
                    {title}
                </h1>
                <p className="text-muted-foreground"> {description}</p>
            </div>
            {/* 始终显示mobilesidebar是否会影响性能？ */}
            <MobileSidebar />
            <UserButton />
        </nav >
    )

}