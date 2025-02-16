import { cn } from '@/lib/utils'
// 定义接受的props类型
interface DottedSeparatorProps {
    className?: string
    color?: string
    height?: string
    dotSize?: string
    gapSize?: string
    direction?: "horizontal" | "vertical"
}
// 导出分隔符组件
export const DottedSeparator = ({
    className, // 接受classname用于控制该组件样式
    color = "#d4d4d8", // 接收一个color用于控制分隔符颜色并赋默认值
    height = '2px', // 分隔符高度
    dotSize = '2px', //圆点的大小
    gapSize = '6px',//每个圆点的间隔
    direction = "horizontal" //判断是水平分割线还是垂直分割线 默认水平方向
}: DottedSeparatorProps) => {
    const isHorizontal = direction === "horizontal"
    return (
        <div className={cn(
            isHorizontal ? "w-full flex items-center " : "h-full flex flex-col items-center",
            // 如果是水平分隔符, 那就让子元素居中铺满,反之则占满整个高度居中对齐
            className //用于传入自定义css类
        )}>
            {/* flexgrow是使元素占满剩余空间 -0则是保持元素原本大小禁止扩展 */}
            <div className={isHorizontal ? "flex-grow" : 'flex-grow-0'} style={{
                width: isHorizontal ? "100%" : height, //如果是水平分隔符则宽度占满,不是则宽度等于传入的分隔符高度height
                height: isHorizontal ? height : "100%",//如果是水平分隔符则高度为height,不是则垂直高度占满
                backgroundImage: `radial-gradient(circle,${color} 25%,transparent 25%)`,//在bgI里面绘制圆点仿虚线
                //背景图的尺寸bgs用于控制绘制出来的点的大小和间隔,如果是水平分隔符则宽度 = (圆点大小 + 间隔), 高度 = `height` 垂直方向：宽度 = `height`, 高度 = (圆点大小 + 间隔)
                backgroundSize: isHorizontal ? `${parseInt(dotSize) + parseInt(gapSize)}px ${height}` : `${height} ${parseInt(dotSize) + parseInt(gapSize)}px`,
                backgroundRepeat: isHorizontal ? 'repeat-x' : 'repeat-y',
                backgroundPosition: "center",
            }}>

            </div>
        </div>
    )
}