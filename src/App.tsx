import React from 'react';
import NavBar from './components/NavBar';
import Tabs from './components/Tabs';
import BannerImage from "./assets/banner.png";
import FooterImage from "./assets/footer.jpg";
import Category from './components/Category';
import styles from "./styles.module.scss";
import { dataSource } from './constants/data';     //这里是导入一个对象，把ts的对象导入，加大括号

//因为footer，还有底下的图片不是交互的重点，所以可以直接在app里面写就好
//中间视频流的数据其实是后台理出来的，这里用一个data.ts去写死，然后把dataSource作为一个对象传入
//传表数据需要在html里面用props的方式传入

function App() {
  return (
    <div className={styles.app}>
      <NavBar />

      <Tabs />

      <div className={styles.line}></div>

      <img className={styles.banner} src={BannerImage} alt='banner'/>

      <h2>{dataSource.hot.title}</h2>
      <Category list={dataSource.hot.list} />

      <h2>{dataSource.live.title}</h2>
      <Category list={dataSource.live.list} />

      <h2>{dataSource.recommend.title}</h2>
      <Category list={dataSource.recommend.list} />


      <img className={styles.banner} src={FooterImage} alt='footer'/>

      <footer className={styles.footer}>
        <span>@Bilibili 2022</span>
      </footer>
    </div>
  );
}

export default App;
