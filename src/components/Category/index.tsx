import { FC, HTMLAttributes } from "react";
import { VideoData } from "../../constants/data";
import styles from "./styles.module.scss";

//这里引入了接口，把接口名改为props
//然后定义了一个对象，里面的list的value值是videoData类型的数组
//相当于引入这个接口，然后给要用到这个接口的东西下定义
//然后后面再在需要的地方去让他运用<props>这个【模板】
//总的来说相当于接口创建————接受接口（定义接口使用的地儿）————调用窗口


//这个接口有点像定义一个模板对象，记录每个参数的格式，后面解构赋值就是用大括号承接这个对象里面的key
interface Props extends HTMLAttributes<HTMLDivElement>{

    //这里不要这么传，onScroll是div的一个属性，
    //改成上面的，用props去继承属性，谁的属性，div的属性
    /*
    Props 接口继承了 HTMLAttributes<HTMLDivElement>，
    这意味着这个组件可以接收所有 <div> 元素支持的 HTML 属性
    */
    //onScroll:()=>void;
    
    list:VideoData[];
}


//这里的接口要定义两次，函数组件定义一次，参数定义一次
//这里把解构赋值挪到下面来了

const Category:FC<Props> =(props:Props)=>{
    const {list, ...divProps}=props;
    //从中解构出 list 属性和其他剩余的属性（...divProps）

    return (
        <div {...divProps} className={styles.category}>
            <ul>
                {list.map(videoData=>(
                    <li key={videoData.id}>
                        <video data-video-id={videoData.id} loop muted src={videoData.src}></video>
                    </li>
                ))}
            </ul>
        </div>
    )
}



export default Category;