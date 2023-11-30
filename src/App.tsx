import React,{useCallback, useEffect, useRef, useState} from 'react';
import { debounce } from 'lodash';
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
1.可以显示和隐藏的navbar
  1.1往下滚动会隐藏
  1.2往上滚动会显示
2.可以吸顶的tabs
3.视频流
3.1命中红线会播放
  3.2未命中红线播放上一次播放的视频（？）
  3.3滚动时，暂停播放
  3.4初始时，播放头两个视频
  3.5横向滚动时，在可视窗口播放

*/

/*
什么时候用useState什么时候用useRef,有什么考量吗
一般来说都是用 useState，一个小技巧是如果这个变量没有用来做页面渲染，就可以用 ref 来替代，这样可以减少 React 刷新
Useref 是同步更新，如果需要改变状态然后立马使用这个状态，就用useref
*/

/*
1.对谁进行滚动识别来实现滚动navBar隐藏显示
对除了navBar和tab之外的东西，用一个大的容器给他们包起来，用来滚动识别
针对这个容器添加一个监听事件的触发，当容器被滚动时，那么navBar会上下显示

那怎么知道此时是往下滚还是往上滚呢，可以记录一个元素的y坐标值，跟他上一次的y坐标值相比
取哪个元素？可以把三个category（页面中最主要的部分，或许后面会用到？）整合成一个div
给这个div整一个类名，然后记录他的y值（变化的状态），既然y值是一个变化的东西，也就是我们要记录状态

那么用state还是ref呢，这里没有涉及到页面渲染，所以就是用ref,函数外部构建一个ref状态，内部调用xx.current,
因为没有用到query去获取，直接在记录的对象html处里面引入ref，相当于构建的ref的contentRef.current就是那个html对象
用getBoundingClientRect记录，返回一个 DOMRect 对象，用解构赋值的形式获取top值，并赋给变量newY
之前的旧值就用数字类型的变量记住，在事件触发的时候不需要调用getBoundingClientRect,因为得到数字类型的newY之后可以更新给原来的oldY

那是否隐藏了呢，需要用到一个state去记录这个隐藏的状态,然后隐藏的时候出现某个类，写特殊的样式
这里要把类写在一整个header里面，让整个header去向上移动

这里发现tab的吸顶也做好了
*/

/*
2.视频流总的来说有三个基本的事件：播放、暂停、停止，分别建立三个事件函数
播放需要获取到html播放的id
因为有多个，先构建多个query可以识别的id查找器，也就是把data-id=xx构建出来
然后用过queryall的方法构建数组
再遍历这个数组直接播放
这样就避免了query被遍历很多次，用all的方法更快

播放、暂停和停止的代码是一样的

sticket / intersection of server是更好的办法？？？
*/


/*
3.初始化视频播放，要记录当前播放的视频有哪些
因此要用state/ref去记录当前的视频是否播放，记录当前播放的视频的id，但是视频播放不涉及到页面渲染，可以用ref节省速度

滚动中，视频停止播放，也需要一个东西记录滚动与否的动作，不用记录视频是否暂停，记录视频是否滚动就已经实现了

滚动停止时，会播放当前命中的视频或者上一次的视频，如果是播放当前视频，那么上一次视频要reset重新来
这与滚动时视频只是暂停播放形成对比

水平滚动的播放，在category里面加上onscroll的事件，但组件不接受这个属性的输入，可以用接口继承的方法

*/

const isInView=(el:HTMLVideoElement)=>{
  const {top, bottom, left, right}=el.getBoundingClientRect();

  //水平方向判断，left是否大于0，right是否小于屏幕的宽度
  const isHorizontalInView = 0 < left && right < window.innerWidth;

  //垂直方向判断，top要在中线的上面，bottom在中线的下面，也就是bottom在中线上面的话，就不播放
  const isVerticalInView = top < window.innerHeight / 2 && window.innerHeight / 2 < bottom;

  return isHorizontalInView && isVerticalInView;
}


function App() {
  const oldYRef=useRef<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const [hidden,setHidden]=useState(false);

  const playingIds=useRef<string[]>([]);

  const isScrolling =useRef<boolean>(false);

  const playAll=(ids:string[])=>{

    //先判断id是否存在，这里是从html中找id，相当于ref.current，先判断是否存在
    //相当于处理异常情况
    if(ids.length===0){
      return;
    }

    //先把所有的video找出来，再遍历播放，而不是每次遍历每次找视频
    //先构建每个id查找号，注意后面要加上join逗号，不然querySelectorAll识别不出来
    const selector=ids.map(id=>`[data-video-id="${id}"]`).join(",");
    
    //把每个id号作为输入query查找，因为是多个id查找号，所以用querySelectorAll
    //并保存结果，把结果转换成正常数组的格式
    const videoEls: HTMLVideoElement[]= Array.from(document.querySelectorAll(selector));

    //要用到.play的话，要先对videoEls声明是一个htmlvideo的格式,上面那一行调用: HTMLVideoElement[]
    videoEls.forEach(el => {el.play()});   
    /*
    ids.forEach(id=>{
      const videoEl:HTMLVideoElement | null=document.querySelector(`[data-video-id="${id}"]`);   //querySelector的格式就是字符串，用中括号括住里面的表达式
      videoEl?.play();
    })
    */
    //把当前播放的ids的清单数组，赋值给当前播放的视频
    playingIds.current=ids;
  }

  const stopAll=(ids:string[])=>{
    if(ids.length===0){
      return;
    }
    const selector=ids.map(id=>`[data-video-id="${id}"]`).join(",");
    const videoEls: HTMLVideoElement[]= Array.from(document.querySelectorAll(selector));
    videoEls.forEach(el => {
      el.pause();
      el.currentTime=0;
      //这里因为HTMLVideoElement没有stop的方法，所以只能用pause
      //然后暂停后把视频的当前时间调整为0，恢复到原始状态，也就是停止了
    });
  }

  const pauseAll=(ids:string[])=>{
    if(ids.length===0){
      return;
    }
    const selector=ids.map(id=>`[data-video-id="${id}"]`).join(",");
    const videoEls: HTMLVideoElement[]= Array.from(document.querySelectorAll(selector));
    videoEls.forEach(el => {el.pause()});   
  }


  //定义滚动停止时的动作
  //为什么会end打印两次，因为每次sethidden（state）的时候，app会进行整个渲染，所以又把onScrollEnd打印了一次
  //用callback，这样的话每次只会生成一个onScrollEnd
  /*
  通常情况下，当父组件重新渲染时，其子组件也会重新渲染。
  如果父组件中定义的函数作为属性传递给子组件时，每次父组件重新渲染时，都会创建一个新的函数实例，即使函数的逻辑没有发生变化。
  这可能导致子组件不必要地重新渲染。使用 useCallback 可以解决这个问题。
  useCallback 接受一个回调函数和一个依赖数组，返回一个经过优化的记忆化版本的回调函数。
  只有当依赖数组中的值发生变化时，才会创建新的回调函数实例。否则，将返回缓存的回调函数实例。
  */

  /*
  把命中滚动的代码放到scroll这里，因为要判断不滚动时的元素是否在红线内
  */

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onScrollEnd=useCallback(debounce(()=>{

    //找html元素
    const videoEls=Array.from(document.querySelectorAll("video"));
    //判断是否命中红线(在app的外层实现，因为不要每次渲染都要判断)
    const inViewVideoEls=videoEls.filter(el=>isInView(el));
    //如果是的话，获取他的id,用来播放
    if(inViewVideoEls.length>0){
      const ids:string[]=inViewVideoEls.map(el=>el.getAttribute("data-video-id") || '')
      
      //播放前，先把旧视频给reset掉
      //怎么找旧视频，不在当前符合条件的列表里的视频
      const stopIds=playingIds.current.filter(id => !ids.includes(id));
      stopAll(stopIds);
      
      //播放，并记录当前播放的视频的id
      playAll(ids);
    } else {
      //如果不是的话，播放上一次命中的视频
      playAll(playingIds.current);
    }
  
    isScrolling.current=false;
  },500),[])


  const onScroll=()=>{

    /*
    这里有个问题：那我在外部设置视频是一直播放的状态，然后onscroll事件一触发，那我就停止视频，不就好了
    不行，因为一旦滚动后，视频停止，然后继续滚动时，视频还是停止状态，也就是这里html没法提供识别滚动停止这种状态
    html的滚动事件识别只能识别滚动时要干嘛，不能识别不滚动时要干嘛，
    也就是只要滚动了一次，视频停了，不滚动时，所有视频都是默认静止的，即使外部设置了自动播放
    而我要求又是滚动时停止，不滚动时一直播放，所以才要额外记录一个状态，主要是记录啥时候不滚动
    */

    //滚动时，停止所有的视频播放,即当前正在播放的视频不要播放了
    if(!isScrolling.current){
      pauseAll(playingIds.current)
    }
    //更新是否滚动的值,是滚动
    isScrolling.current=true;

    /*
    那什么时候滚动停止呢
    设一个计时，只要滚动了，每次计时都会重新开始，
    一旦计时超过某个数值，就表示不滚动
    放在onScroll的最后面
    停止时要干嘛，设置current值为false
    */


    //凡是要用到ref.current的，就是要先给一个判断看存在不存在？
    if(contentRef.current){

      //获取新值的top数字，构建差值
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

    /*
    相当于debounce（）  需要装一个npm install lodash
    debounce用于限制某个函数在短时间内被频繁调用的情况。
    要用于处理用户输入、窗口调整大小、滚动事件等需要频繁触发的事件
    通过在事件处理函数中包装 debounce()，可以确保事件处理函数不会被连续调用，只在特定的时间间隔后才执行。
    后面加括号表示执行

    不能在onscroll的事件函数里面用debounce，不然每次scroll都要创建函数很多次，把函数挪到外面
    */
    onScrollEnd();

  };

  //初始交互！！！
  //创建全局监听器，在组件初始化渲染时，获取头两个视频的id数组，传入给palyAll函数并执行
  useEffect(()=>{
    const initVideoIds=dataSource.hot.list.slice(0,2).map(item=>item.id);
    playAll(initVideoIds);
    //这里本来后面有代码：把此时的这两个视频的id更新给当前的playingid
    //但是因为本来每次播放都要更新id，所以挪到上面的playAll事件函数里面了

  },[]);


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
          <Category onScroll={onScroll} list={dataSource.hot.list} />

          <h2>{dataSource.live.title}</h2>
          <Category onScroll={onScroll} list={dataSource.live.list} />

          <h2>{dataSource.recommend.title}</h2>
          <Category onScroll={onScroll} list={dataSource.recommend.list} />
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
