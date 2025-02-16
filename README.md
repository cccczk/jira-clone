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