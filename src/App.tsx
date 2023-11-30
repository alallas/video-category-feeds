import React,{useRef, useState} from 'react';
import classNames from "classnames"
import NavBar from './components/NavBar';
import Tabs from './components/Tabs';
import BannerImage from "./assets/banner.png";
import FooterImage from "./assets/footer.jpg";
import Category from './components/Category';
import styles from "./styles.module.scss";
import { dataSource } from './constants/data';     //这里是导入一个对象，把ts的对象导入，加大括号

//因为footer，还有底下的图片不是交互的重点，所以可以直接在app里面写就好
//中间视频流的数据其实是后台理出来的，这里用一个data.ts去写死，然后把dataSource作为一个对象传入
//传表数据需要在html里面用props的方式传入(只要是涉及到任何文字、视频、资源等数据，都要用prop来传)

/*
1.对谁进行滚动识别来实现滚动navBar隐藏显示
对除了navBar和tab之外的东西，用一个大的容器给他们包起来，用来滚动识别
针对这个容器添加一个监听事件的触发，当容器被滚动时，那么navBar会上下显示
那怎么知道此时是往下滚还是往上滚呢，可以记录一个元素的y坐标值，跟他上一次的y坐标值相比
取哪个元素？可以把三个category（页面中最主要的部分，或许后面会用到？）整合成一个div
给这个div整一个类名，然后记录他的y值（变化的状态），既然y值是一个变化的东西，也就是我们要记录状态
那么用state还是ref呢，这里没有涉及到页面渲染，所以就是用ref,函数外部构建一个ref状态，内部调用xx.current,记得要在记录的对象html处里面引入ref
用getBoundingClientRect记录，返回一个 DOMRect 对象，用解构赋值的形式获取top值，并赋给变量newY
之前的旧值就用数字类型的变量记住，在事件触发的时候不需要调用getBoundingClientRect,因为得到数字类型的newY之后可以更新给原来的oldY

那是否隐藏了呢，需要用到一个state去记录这个隐藏的状态,然后隐藏的时候出现某个类，写特殊的样式
*/


function App() {
  const oldYRef=useRef<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const [hidden,setHidden]=useState(false);

  const onScroll=()=>{
    if(contentRef.current){

      //创建旧值和新值
      const {top:newY}=contentRef.current.getBoundingClientRect();
      const delta=newY-oldYRef.current;

      //更新值
      oldYRef.current=newY;

      //上面的y是小于下面的y的，y轴（y=0）在页面顶部
      if(delta<0){
        setHidden(true);
      } else{
        setHidden(false);
      }

    }


  }

  return (
    <div className={styles.app}>
      <header className={classNames(styles.header,{[styles.hidden]:hidden})}>
        <NavBar title="首页" />
        
        <Tabs />
      </header>

      <div className={styles.line}></div>

      <div className={styles.scrollView} onScroll={onScroll}>
        <img className={styles.banner} src={BannerImage} alt='banner'/>

        <div ref={contentRef} className={styles.content}>
          <h2>{dataSource.hot.title}</h2>
          <Category list={dataSource.hot.list} />

          <h2>{dataSource.live.title}</h2>
          <Category list={dataSource.live.list} />

          <h2>{dataSource.recommend.title}</h2>
          <Category list={dataSource.recommend.list} />
        </div>


        <img className={styles.banner} src={FooterImage} alt='footer'/>

        <footer className={styles.footer}>
          <span>@Bilibili 2022</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
