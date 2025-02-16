"use client"

import Image from "next/image"
import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import Link from "next/link"


interface AuthLayoutProps {
    children: ReactNode
}


const AuthLayout = ({ children }: AuthLayoutProps) => {
    const pathname = usePathname()
    const isSignIn = pathname ==="/sign-in"
    
    return (
        <main className="bg-neutral-100 min-h-screen">
            <div className="mx-auto max-w-screen-2xl p-4">
                <nav className="flex justify-between items-center">
                    <Image src="/logo.svg" height={56} width={152} alt="Logo"></Image>
                    <Button variant="secondary">
                        <Link href={isSignIn? "/sign-up" : "/sign-in"}>
                            {isSignIn? "去注册" : "去登陆"}
                        </Link>
                        
                    </Button>
                </nav>
                <div className="flex flex-col items-center justify-center pt-4 md:pt-4">
                    {children}
                </div>
            </div>
        </main>
    )
}

export default AuthLayout