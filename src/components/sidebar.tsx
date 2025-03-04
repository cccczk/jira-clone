import Image from "next/image"
import Link from "next/link"
import { DottedSeparator } from "./dotted-separator"
import { Navigation } from "./navigation"

export const Sidebar = () => {
    return (
        // 为什么用aside不用div？ 1.语义化标签 易于维护 2. SEO友好 3. 屏幕阅读器友好
        <aside className="h-full bg-neutral-100 p-4 w-full">
            <Link href="/">
                <Image src="/logo.svg" alt="logo" width={164} height={48}/>
            </Link>
            <DottedSeparator className="my-4" />
            <Navigation />
        </aside>
    )
}