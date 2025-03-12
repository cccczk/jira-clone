"use client"
import { z } from "zod"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { DottedSeparator } from '@/components/dotted-separator'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from "next/link"
import { registerSchema } from "../schema"
import { useRegister } from "../api/use-register"
import { signUpWithGithub, signUpWithGoogle } from "@/lib/server/oauth"
// 使用zod快速定义表单数据的验证规则

export const SignUpCard = () => {
    const {mutate,isPending} = useRegister()
    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),//规则
        defaultValues: {
            name: "",
            email: "",
            password: ""
        }
    })
    const onSubmit = (value: z.infer<typeof registerSchema>) => {
        mutate({
            json: value
        })
    }
    return (
        <Card className='w-ful h-full md:w-[487px] border-none shadow-none'>
            <CardHeader className='flex items-center justify-center text-center p-7'>
                <CardTitle className='text-2xl'>
                    注册
                </CardTitle>
                <CardDescription>
                    登录即代表您同意我们的{""}
                    <Link href="/privacy">
                        <span className="text-blue-700 ">隐私政策</span>
                    </Link>{""}
                    和{""}
                    <Link href="/terms">
                        <span className="text-blue-700 ">服务条款</span>
                    </Link>
                </CardDescription>
            </CardHeader>
            <div className='px-7 mb-2'>
                <DottedSeparator />
            </div>
            <CardContent className='p-7'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}  className="space-y-4">
                        <FormField
                            name="name"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            type='text'
                                            placeholder='请输入姓名'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            type='email'
                                            placeholder='请输入邮箱号'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            type='password'
                                            placeholder='请输入密码'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button disabled={isPending} size='lg' className='w-full'>注册</Button>
                    </form>
                </Form>

            </CardContent>
            <div className='px-7'>
                <DottedSeparator />
            </div>
            <CardContent className='p-7 flex flex-col gap-y-4'>
                <Button onClick={() => signUpWithGoogle()} disabled={isPending} variant="secondary" size='lg' className='w-full'>
                    <FcGoogle  className="mr-2 size-5" />
                    使用google登录
                </Button>
                <Button onClick={()=>signUpWithGithub()}  disabled={isPending} variant="secondary" size='lg' className='w-full'>
                    <FaGithub className="mr-2 size-5" />
                    使用github登录
                </Button>
            </CardContent>
            <CardContent className="p-7 flex items-center justify-center">
                <p>
                    已有帐号?
                    <Link href='/sign-in'>
                        <span className="text-blue-700">
                            &nbsp;去登录
                        </span>

                    </Link>
                </p>
            </CardContent>
        </Card>
    )
}