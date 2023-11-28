import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import "./global.scss";    //这个global可以理解成是针对index.tsx的css

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

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<App />);


