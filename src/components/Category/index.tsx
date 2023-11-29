import { FC } from "react";
import { VideoData } from "../../constants/data";
import styles from "./styles.module.scss";

//这里引入了接口，把接口名改为props
//然后定义了一个对象，里面的list的value值是videoData类型的数组
//相当于引入这个接口，然后给要用到这个接口的东西下定义
//然后后面再在需要的地方去让他运用<props>这个【模板】
//总的来说相当于接口创建————接受接口（定义接口使用的地儿）————调用窗口


interface Props{
    list:VideoData[];
}


//这里的接口要定义两次，函数组件定义一次，参数定义一次
//这里把解构赋值挪到下面来了

const Category:FC<Props> =(props:Props)=>{
    const {list}=props;

    return (
        <div className={styles.category}>
            <ul>
                {list.map(videoData=>(
                    <li key={videoData.id}>
                        <video src={videoData.src}></video>
                    </li>
                ))}
            </ul>
        </div>
    )
}



export default Category;