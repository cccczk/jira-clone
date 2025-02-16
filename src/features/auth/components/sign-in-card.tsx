"use client"
import { z } from "zod"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DottedSeparator } from '@/components/dotted-separator'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card'

import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form"
import { Button } from '@/components/ui/button'
import Link from "next/link"
// 使用zod快速定义表单数据的验证规则
const formSchema = z.object({
    email: z.string().min(1, "此为必填项").email(),
    password: z.string().min(1, "此为必填项"),
})

export const SignInCard = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),//规则
        defaultValues: {
            email: "",
            password: ""
        }
    })
    const onSubmit = (value: z.infer<typeof formSchema>) => {
        console.log(value);

    }
    return (
        <Card className='w-ful h-full md:w-[487px] border-none shadow-none'>
            <CardHeader className='flex items-center justify-center text-center p-7'>
                <CardTitle className='text-2xl'>
                    Welcome back
                </CardTitle>
            </CardHeader>
            <div className='px-7 mb-2'>
                <DottedSeparator />
            </div>
            <CardContent className='p-7'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
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
                                            type='password'
                                            placeholder='请输入密码'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button disabled={false} size='lg' className='w-full'>登录</Button>

                    </form>
                </Form>
            </CardContent>
            <div className='px-7'>
                <DottedSeparator />
            </div>
            <CardContent className='p-7 flex flex-col gap-y-4'>
                <Button disabled={false} variant="secondary" size='lg' className='w-full'>
                    <FcGoogle className="mr-2 size-5" />
                    使用google登录
                </Button>
                <Button disabled={false} variant="secondary" size='lg' className='w-full'>
                    <FaGithub className="mr-2 size-5" />
                    使用github登录
                </Button>
            </CardContent>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7 flex items-center justify-center">
                <p>
                    还没有注册帐号?
                    <Link href='/sign-up'>
                        <span className="text-blue-700">
                            &nbsp;去注册
                        </span>
                        
                    </Link>
                </p>
            </CardContent>
        </Card>
    )
}