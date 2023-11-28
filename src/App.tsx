import React from 'react';
import NavBar from './components/NavBar';
import Tabs from './components/Tabs';
import BannerImage from "./assets/banner.png";
import FooterImage from "./assets/footer.jpg";
import Category from './components/Category';
import styles from "./styles.module.scss";
import { dataSource } from './constants/data';

//因为footer，还有底下的图片不是交互的重点，所以可以直接在app里面写就好

function App() {
  return (
    <div className={styles.app}>
      <NavBar />

      <Tabs />

      <img className={styles.banner} src={BannerImage} alt='banner'/>

      <h2>{dataSource.hot.title}</h2>
      <Category />

      <h2>{dataSource.live.title}</h2>
      <Category />

      <h2>{dataSource.recommend.title}</h2>
      <Category />


      <img className={styles.banner} src={FooterImage} alt='footer'/>

      <footer className={styles.footer}>
        <span>@Bilibili 2022</span>
      </footer>
    </div>
  );
}

export default App;
