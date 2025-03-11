# 2025/2/16
## 按需引入组件
直接执行npx shadcn@2.1.0 add button出现错误
>  `Something went wrong. Please check the error below for more details.
> If the problem persists, please open an issue on GitHub.
> 
> request to https://ui.shadcn.com/r/index.json failed, reason: Client > network socket disconnected before secure TLS connection was established`

在github中搜索shadcn-ui别人提交的解决方案
> 1. Verify network access
>curl https://ui.shadcn.com/r/index.json  # Should return 200 OK
>
> 2. Minimize proxy settings (PowerShell)
>$env:HTTPS_PROXY="http://127.0.0.1:7890"  # Replace with your proxy port
>这里写自己的代理地址和端口
> 3. Run installation with global flag
>npx --location=global shadcn@latest init
>这一步好像不用执行，直接执行npx shadcn@2.1.0 add button就能成功

## 利用tailwindcss直接快速自定义组件样式
__学习成本是否过高？__
需要非常熟悉css各个属性及英语简写形式

## NextJS

NextJS不需要配置路由，其自带AppRouter 只需要在app的文件夹下建立一个由对应url命名文件夹下再创建一个page.tsx文件即可,同时，如果创建一个layout.tsx的文件.那么就会以此文件作为url的展示页,需要在layout处写入children来渲染page

>sign-in/layout.tsx

    interface SignInLayoutProps {
        children: React.ReactNode
    }
    const SignInLayout = ({ children }:     SignInLayoutProps) => {
        return (
            <div className="flex flex-col">
                <nav className="bg-red-500 h-10">
                    <p>navbar</p>
                </nav>
                {children}
            </div>
        )
    }

    export default SignInLayout
若是想要在创建子级url,则可在此文件夹下再创建一个文件夹

## cn()

cn可看作classnames 用于动态合并类名或条件渲染类名\

## ts表单 zod结合useForm

    const formSchema = z.object({
        email: z.string().email(),
        password: z.string(),
    })

    //<T>	泛型语法，告诉函数/组件要用哪种类型
    //useForm<T>()	告诉 useForm 这个表单的数据类型
    //z.infer<typeof formSchema>	自动推导 formSchema 里的数据类型
    //useForm<z.infer<typeof formSchema>>()	让 useForm 知道表单的正确类型

    const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),//规则
            defaultValues: {
                email: "",
                password: ""
            }
        })


# 2025/2/17
## 在api目录下设置文件夹结构
>使用honojs作为

    /app/api/[[...route]]/route.ts
## 使用tanstack query提供全局API数据缓存,避免重复请求
>可以使用reqct query来管理数据而不需要useState来存储API结果

    /app/(auth)/layout.tsx
    ...
    <div className="flex flex-col items-center justify-center pt-4 md:pt-4">
        <QueryProvider >{children}</QueryProvider>
    </div>

## API管理
把请求写在/src/features/server/route.ts下,再统一导入到/app/api/[[...route]]/route.ts中

>封装一个登录请求useLogin(自定义hook)

    /features/auth/api/use-login

    import { useMutation } from "@tanstack/react-query";
    import { InferRequestType, InferResponseType } from "hono";
    import { client } from '@/lib/rpc'
    
    //定义请求和响应的类型 (ResponseType 和 RequestType)。
    type ResponseType = InferResponseType<typeof client.api.auth.login["$post"]>
    type RequestType = InferRequestType<typeof client.api.auth.login["$post"]>  ["json"]

    export const useLogin = () => {
        const mutation = useMutation<
            ResponseType,
            Error,
            RequestType
        >({
            mutationFn: async (json) => {
                const response = await client.api.auth.login["$post"]({ json })
                return await response.json()
            }
        })
        return mutation
    }

## bug 
因为file是浏览器环境的API,在服务器端 File 可能是 undefined，或者在 zod 解析过程中 instanceof 可能无法正确识别 File 类型，导致编译错误。

修改 /workspaces/schema.ts

原

    export const createWorkspacesSchema = z.object({
         name: z.string().trim().min(1, "Required"),
         image: z.union([
             z.instanceof(File),
             z.string().transform((value) => value === "" ? undefined : value),
         ])
         .optional()          
     })
修改后

    export const createWorkspacesSchema = z.object({
        name: z.string().trim().min(1, "Required"),
        image: z
            .union([
                z.custom<File>((val) => typeof File !== "undefined" && val instanceof File),
                z.string().transform((value) => (value === "" ? undefined : value)),
            ])
            .optional(),
    });

此时报错由500变为400 所以开始检查数据格式

一小时无法解决 现在400 =》 200 但是依旧无法上传图片 imageurl为null



## 创建loading组件缓解白屏问题


## 手写不同设备下的模态框组件



## useQueryState和useState

使用 useQueryState 和 useState 的核心区别在于：useQueryState 让状态存储在 URL 查询参数中，而 useState 仅存储在组件的内部状态中。

## 自定义hook获取workspaceId

import { useParams } from "next/navigation";    

export const useWorkspaceId = () => {
    const params = useParams()

    return params.workspaceId as string
}

##  bug 调用接口时500 参数错误
打印form发现为undefined

    const response = await client.api.workspaces[":workspaceId"]["$patch"]({ form,param })

排查mutate时参数可能未正确提交

    const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
        const formData = {
            ...values,
            image: values.image instanceof File ? values.image : undefined
        }
        // 
        mutate({
            formData,
            param: {workspaceId: initialValues.$id}
        }, {
            onSuccess: ({ data }) => { 
                form.reset()
                // onCancel?.()
                router.push(`/workspaces/${data.$id}`)
            }
        })
    }

此时formdata还是存在的，能log出来 

改写onsubmit

    const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : ""
        }
        console.log("edit formdata",form);
        
        mutate({
            form: finalValues,
            param: {workspaceId: initialValues.$id}
        }, {
            onSuccess: ({ data }) => { 
                form.reset()
                // onCancel?.()
                router.push(`/workspaces/${data.$id}`)
            }
        })
    }

表面问题在于传参错误，后端定义的接收数据为form 我这里直接传formdata命名不一样，报错500 根源问题还是图片上传时nodejs环境下file不存在导致无法上传图片而更改代码引发的错误

## 白屏时间太长

## 后期修改 只剩一人移除成员时无提示 自己是管理员设置自己是成员也没有提示 提示太少

## 创建了error处理界面 通过在app下的error.tsx 和loader

## 登录有时候会突然失效然后无法再次登录