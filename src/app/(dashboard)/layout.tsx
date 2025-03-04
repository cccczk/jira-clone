import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"

interface DashboardLayoutProps {
    children: React.ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    return (
        <div className="min-h-screen">
            <div className="flex w-full h-full">
                {/* tailwind的响应式操作 判断在lg屏幕及以上使用此样式 */}
                <div className="fixed left-0 top-0 hidden lg:block lg:w-[264px] h-full overflow-y-auto">
                    <Sidebar />
                </div>
                <div className="lg:pl-[264px] w-full">
                    {/* 保证拉伸后此div不变大（2xl以内） */}
                    <div className="mx-auto max-w-screen-2xl h-full">
                        <Navbar />
                        <main className="h-full py-8 px-6 flex flex-col">
                            {children}
                        </main>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default DashboardLayout