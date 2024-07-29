import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 从 react-router-dom 导入 useNavigate
import './StoryPage.css';
// import './StoryPage-pad.css'
import SketchPad from './SketchPad.jsx';
import './util.js'
import { generateStory, updateStory } from './util.js';

export default function StoryPage1() { 
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [savedDrawing, setSavedDrawing] = useState(''); // 新状态用于存储保存的画作
  const [showSketchPad, setShowSketchPad] = useState(false);
  const [recording, setRecording] = useState(false);// 录音文件
  const [button1Image, setButton1Image] = useState('button1none.png');
  const [button2Image, setButton2Image] = useState('button2none.png'); // 新状态追踪按钮2的图标

  let hasPlayedAudio = false;

  // // 处理点击事件
  const toggleBackgroundImage = () => {
    const newBackgroundImage = backgroundImage === 'background1.png' ? 'background1_2.png' : 'background1.png';
    setBackgroundImage(newBackgroundImage); 
    console.log(newBackgroundImage)
    console.log('button1Image')
  // 当更换为特定背景且音频未播放过时，播放音频并标记为已播放
    // if (newBackgroundImage === 'background1_2.png' && !hasPlayedAudio) {
      // playAudio('story1_2voice.mp3');
      // hasPlayedAudio = true; // 更新状态为已播放
    // }
  };

  const navigate = useNavigate;
  const handleChooseBackground = () => {
    navigate('/choose'); // 导航到 ChoosePage
  };

  const handleDraw = () => {
    const isSketchPadVisible = !showSketchPad;
      setShowSketchPad(isSketchPadVisible);// 显示SketchPad画布
      setButton2Image('button2.png'); // 更新按钮2的图标状态
      setShowSketchPad(isSketchPadVisible); // 同步切换sketchpad.png图像的显示状态
      if (!isSketchPadVisible) {
      // 当画板已显示并且再次点击按钮2时执行保存画作并关闭画板的操作
      handleSaveDrawing(); // 调用保存画作的函数
      setSavedDrawing('savedraw1.png'); // 这里应替换为实际保存画作的逻辑后得到的文件名
      setShowSketchPad(false); // 关闭SketchPad画布
      setButton2Image('button2none.png'); // 重置按钮2的图标状态为初始状态
    } else {
      setButton2Image('button2.png'); // 显示SketchPad时更新按钮2的图标状态
    }
  };
  const handleSaveDrawing = () => {   // 处理保存画作
    setSavedDrawing('savedraw1.png'); // 更新状态为指定的画作图像
  };
  const handleSetBackgroundToFirst = () => {  // 处理返回故事初始
    setBackgroundImage('background1.png');
  };
  const handleShowCreateBackground = () => { // 显示创作背景
    setBackgroundImage('createground.png');
  };

  const toggleRecording = () => {
    console.log("enter recording")

    if (!recording) {
      // 如果当前未在录音，则开始录音

      setButton1Image('button1.png'); // 更改按钮图标为录音状态
      setRecording(true); // 更新录音状态
      console.log("recording start");
    } else {// 如果当前正在录音，则停止录音

      setButton1Image('button1none.png'); // 更改按钮图标回非录音状态
      setRecording(false); // 更新录音状态 // 当录音停止并且数据可用时, 创建Blob并发送数据

    };
  };

  useEffect(() => {
      // 这个函数会在组件挂载后立即执行
      initFunction();
    }, []); // 传入空数组确保这个副作用只在组件挂载时运行一次
  
  const initFunction = () => {
    // 目前没有处理逻辑，你可以在这里添加你需要的初始化代码
    console.log('初始化函数被执行');
    updateStory(1,1);
    console.log(generateStory('hello'));
  };

  

  return (
    <div>
    <div className="story-page">
      {/* 顶部导航栏 */}
      <nav>
        <button id='buttonchoose' className="buttonchoose" onClick={handleChooseBackground}><img src="choose.png" alt="Choose"/></button>
        <button id='buttonrestart' className="buttonrestart" onClick={handleSetBackgroundToFirst}><img src="start.png" alt="start"/></button>
        <button id='buttoncreate' className="buttoncreate" onClick={handleShowCreateBackground}><img src="create.png" alt="start"/></button>
        <button id='buttonnote' className="buttonnote" onClick={handleShowCreateBackground}><img src="note.png" alt="start"/></button>
      </nav>
  
      {/* 主内容区域 */}
      <main className="main-content">
        <button id='buttonstory' className='buttonstory' onClick={toggleBackgroundImage}>
          {/* 这里可以加入您的主要内容 */}
        </button>
        
         {showSketchPad && <SketchPad />}
        
         <div className="story-page" onClick={toggleBackgroundImage}>
          {showSketchPad ? (<SketchPad />) : (<div className="illustration-placeholder" />)
          }
        </div>

            {showSketchPad && (
            <div className="sketchpad-image-container">
                <img src={`${process.env.PUBLIC_URL}/sketchpad.png`} alt="SketchPad" />
            </div>
          )}
        </main>
      </div>

      {/* 右侧的交互区域 */}
      <div>
         <button className="interaction-button1" onClick={toggleRecording}><img src={button1Image} alt="Draw"/></button>
         <button className="interaction-button2" onClick={handleDraw}><img src={button2Image} alt="Draw"/></button>
           <div>
             {/* 给savedrawing补图 */}
             {savedDrawing && <img src={savedDrawing} alt="Saved Drawing" />}
           </div>
       </div>
       <div id="savestage2" className="save-stage1" /><img src="savestage.png" alt="start"/>
       <div id="savestage1" className="save-stage2" /><img src="savestage.png" alt="start"/>
       <div>
         {/* savestage2的内容 */}
       </div>
       </div> 
    )
};
