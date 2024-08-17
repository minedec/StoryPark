import React, { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import SketchPad from './SketchPad.jsx';
import './util.js'
import { 
  generateStory, 
  updateStory, 
  sendAudioFile, 
  getText2Voice, 
  getVoice2Text, 
  playSound, 
  extractKeyword, 
  downloadImageFromServer, 
  drawbackContext,
  setTesterName,
  restartNewStory
} from './util.js';
import {Container, Col, Row, Button, Form, Image, Stack } from 'react-bootstrap'
import MicRecorder from 'mic-recorder-to-mp3';
import {userm, sketchObj, tempData, storyIsInteract} from './App.js'
import magicSketchpad from './assets/white-background.png';
import { flushSync } from 'react-dom';

export default function StoryPage() {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(magicSketchpad);
  const [backgroundKey, setBackgroundKey] = useState(0);
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const updateBackgroundImage = useCallback((newImageUrl) => {
    console.log('update backimage:' + newImageUrl);
    setBackgroundImageUrl(newImageUrl);
    setBackgroundKey(prevKey => prevKey + 1);
    forceUpdate(); // 强制重新渲染
  }, []);

  useEffect(() => {
    console.log('Background has been updated to:', backgroundImageUrl);
  }, [backgroundImageUrl]);

  const DivBak = {
    backgroundColor: 'transparent',
    backgroundImage: `url(${backgroundImageUrl}?${new Date().getTime()})`,
    backgroundSize: 'cover',
    minHeight: '80vh',
    maxWidth: '100vw',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderRadius: '15px',
    marginTop: '3vh',
    marginBottom: '3vh',
  }

  const SpeakButtonStyle = {
    backgroundColor: 'transparent',
    backgroundImage: 'url(./button1none.png)',
    border: 'none',
    width: '110px',
    height: '130px',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    top: '10%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }

  const SketchButtonStyle = {
    backgroundColor: 'transparent',
    backgroundImage: 'url(./button2none.png)',
    border: 'none',
    width: '120px',
    height: '140px',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    top: '15%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }

  const StoryTextStyle = {
    width: '200px',
    height: '100px',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }

  const VerticalProgressStyle = {
    position: 'relative',
    width: '30px',
    height: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
  }

  const StepStyle = {
    position: 'absolute',
    width: '70px',
    height: '40px',
    borderRadius: '20px',
    backgroundColor: '#e7e7e7',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2,
  }

  const LineStyle = {
    position: 'absolute',
    top: '0',
    bottom: '0',
    width: '20px',
    backgroundColor: '#8080df',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1,
  }

  const imageStyle = {
    maxWidth: '100%',
    height: '100%',
    border: '2px solid black',
    position: 'relative',
    top: '15%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    marginTop: '2px',
    marginBottom: '2px',
  }

  const [textContent, setTextContent] = useState('for debug');
  const updateTextContent = (newText) => {
    setTextContent(newText);
  };

  const handleStoryInteract = async () => {
    if(window.StoryState.chapterIndex === 1) {
      if(storyIsInteract._storyIsInteract) return;
      storyIsInteract._storyIsInteract = true;
      console.log('这是故事1的场景1');
      changeStepColor(window.StoryState.chapterIndex);
      let response = await generateStory(window.StoryState.storyIndex, window.StoryState.chapterIndex, 'hello');
      console.log(response);
      console.log("intercat is ", storyIsInteract._storyIsInteract);

      let cnt = 0;
      while((response === null || response.story === null || response.story === undefined) && cnt < 8) {
        
        console.log('故事1第'+cnt+'次尝试生成故事');
        response = await generateStory(window.StoryState.storyIndex, window.StoryState.chapterIndex,'hello');
        cnt++;
      }
      if(response === null) {
        console.log("网络异常 llm接口失效")
        return;
      }
      
      let audioUrl_story = await getText2Voice(response.story);
      console.log('sotry_audioUrl '+ audioUrl_story);

      let audioUrl_interact = await getText2Voice(response.interact);
      console.log('interact_audioUrl '+ audioUrl_interact);
      console.log('播放story:'+response.story);

      if (audioUrl_story) {
        await playSound(audioUrl_story);
      }

      console.log('更新背景图1');
      window.isSketch = false;
      window.isSpeak = false;
      let newImageUrl = './'+window.StoryState.storyIndex+'-'+window.StoryState.chapterIndex+'.png';
      setTimeout(() => {
        updateBackgroundImage(newImageUrl);
        forceUpdate();
      }, 0);
      
      console.log('播放interact:'+response.interact);
      if (audioUrl_interact) {
        await playSound(audioUrl_interact);
      }
      
      window.isSpeakDown = false;
      window.isSketchDown = false;
      storyIsInteract._storyIsInteract = false;
    } else if (window.StoryState.chapterIndex === 2) {
      /**
       * 章节2时 generate story部分在上���环节的speak之后完成，在sketch过程中调用故事生成
       * overlap掉故事生成的开销，speak环节生成的故事保存在tempData._tempData中
       *  */ 
      if(storyIsInteract._storyIsInteract) return;
      if(!window.isSpeakDown || !window.isSketchDown) return;
      storyIsInteract._storyIsInteract = true;
      console.log('这是故事1的场景2');
      console.log('此处生成故事并播放，story:'+window.StoryState.storyIndex+',chapter:'+window.StoryState.chapterIndex);
      changeStepColor(window.StoryState.chapterIndex);

      // const response = await generateStory(userm._userm);
      console.log('cached story', tempData._tempData);
      let cnt = 0;
      while((tempData._tempData === null || tempData._tempData.story === null || tempData._tempData.story === undefined) && cnt < 5) {
        console.log('故事2第'+cnt+'次尝试生成故事');
        tempData._tempData = await generateStory(window.StoryState.storyIndex, window.StoryState.chapterIndex, userm._userm);
        cnt++;
      }
      if(tempData._tempData === null) {
        console.log("网络异常 llm接口失效")
        return;
      }

      let audioUrl_story = await getText2Voice(tempData._tempData.story);
      // tempData._tempData = audioUrl;
      console.log('audioUrl_story '+ audioUrl_story);
      let audioUrl_interact = await getText2Voice(tempData._tempData.interact);
      console.log('audioUrl_interact '+ audioUrl_interact);

      console.log('播放story:'+tempData._tempData.story);
      if (audioUrl_story) {
        await playSound(audioUrl_story);
      }

      console.log('更新背景图2');
      let newImageUrl = './'+window.StoryState.storyIndex+'-'+window.StoryState.chapterIndex+'.png';
      updateBackgroundImage(newImageUrl);
      
      console.log('播放interact:'+tempData._tempData.interact);
      if (audioUrl_interact) {
        await playSound(audioUrl_interact);
      }

      window.isSpeakDown = false;
      window.isSketchDown = false;
      storyIsInteract._storyIsInteract = false;
    } else if(window.StoryState.chapterIndex === 3) {
      if(storyIsInteract._storyIsInteract) return;
      if(!window.isSpeakDown || !window.isSketchDown) return;
      storyIsInteract._storyIsInteract = true;
      console.log('这是故事1的场景3');
      console.log('此处生成故事结尾并播放到问题，story:'+window.StoryState.storyIndex+',chapter:'+window.StoryState.chapterIndex);
      changeStepColor(window.StoryState.chapterIndex);

      // const response = await generateStory(userm._userm);
      console.log('cached story', tempData._tempData.story);
      console.log('cached q1', tempData._tempData.Q1);
      let cnt = 0;
      while((tempData._tempData === null || tempData._tempData.story === null || tempData._tempData.story === undefined) && cnt < 5) {
        console.log('故事3第'+cnt+'次尝试生成故事');
        tempData._tempData = await generateStory(window.StoryState.storyIndex, window.StoryState.chapterIndex, userm._userm);
        cnt++;
      }
      if(tempData._tempData === null) {
        console.log("网络异常 llm接口失效")
        return;
      }

      const audioUrl_story = await getText2Voice(tempData._tempData.story);
      const audioUrl_Q1 = await getText2Voice(tempData._tempData.interact);
      console.log('audioUrlstory '+ audioUrl_story);

      console.log('播放story:'+tempData._tempData.story);
      if (audioUrl_story) {
        await playSound(audioUrl_story);
      }

      let newImageUrl = './'+window.StoryState.storyIndex+'-'+window.StoryState.chapterIndex+'.png';
      updateBackgroundImage(newImageUrl);

      console.log('播放q1:'+tempData._tempData.interact);
      if (audioUrl_Q1) {
        await playSound(audioUrl_Q1);
      }

      window.isSpeakDown = false;
      window.isSketchDown = false;
      storyIsInteract._storyIsInteract = false;
    } else if(window.StoryState.chapterIndex >= 4) {
      /**
       * 此处处理问题3的回复并生成到结尾总结
       */
      if(storyIsInteract._storyIsInteract) return;
      storyIsInteract._storyIsInteract = true;
      if(window.StoryState.chapterIndex == 6) {
        console.log('这是故事收尾');
        changeStepColor(4);
        await updateStory(window.StoryState.storyIndex, 5);
        let response = await generateStory(window.StoryState.storyIndex, 5, userm._userm);
        let cnt = 0;
        while((response === null || response.interact === undefined) && cnt < 5) {
          console.log('场景5第'+cnt+'次尝试生成结尾');
          response = await generateStory(window.StoryState.storyIndex, 5, userm._userm);
          cnt++;
        }
          if(response === null) {
            console.log("网络异常 llm接口失效")
            return;
          }
        console.log(response);
        const audioUrl = await getText2Voice(response.interact);
        console.log('播放结尾:'+response.interact);
        console.log('audioUrl '+ audioUrl);
        if (audioUrl) {
          await playSound(audioUrl);
        }
        
        window.isSpeakDown = false;
        window.isSketchDown = false;
        storyIsInteract._storyIsInteract = false;
        userm._userm = '';
        tempData._tempData = null;
        
        return;
      }
      /**
       * 此处处理问题1和问题2的回复
       */
      console.log('这是故事1的场景4');
      console.log('此处生成问题反馈并播放下一个问题，story:'+window.StoryState.storyIndex+',chapter:'+window.StoryState.chapterIndex);
      changeStepColor(4);
      await updateStory(window.StoryState.storyIndex, 4);

      let response = await generateStory(window.StoryState.storyIndex, 4, userm._userm);
      let cnt = 0;
      while((response === null || response.guidance === null || response.interact === undefined) && cnt < 5) {
        console.log('场景4第'+cnt+'次尝试生成反馈');
        response = await generateStory(window.StoryState.storyIndex, 4, userm._userm);
        cnt++;
      }
      if(response === null) {
        console.log("网络异常 llm接口失效")
        return;
      }
      console.log(response);
      const audioUrl = await getText2Voice(response.guidance + response.interact);
      console.log('audioUrl '+ audioUrl);
      console.log('播放q2或q3:'+response.guidance + response.interact);
      if (audioUrl) {
        await playSound(audioUrl);
      }

      window.isSpeakDown = false;
      window.isSketchDown = false;
      storyIsInteract._storyIsInteract = false;
    }
  };

  useEffect(() => {
      // 监听 window.StoryState 的变化
    const handleStoryStateChange = async () => {
      console.log('storyIndex or chapterIndex changed');
      console.log('handlestorystatechange:' + window.StoryState.chapterIndex)
      await updateStory(window.StoryState.storyIndex, window.StoryState.chapterIndex);
      updateTextContent(`story${window.StoryState.storyIndex}chapter${window.StoryState.chapterIndex}`);
      // if(window.StoryState.chapterIndex === 0) {
      //   initFunction();
      // }
      await handleStoryInteract();
      return;
    };

    // 添加事件监听器
    window.addEventListener('storyStateChangeEvent', handleStoryStateChange);
    async function initialize() {
      await initFunction();
      storyStateChange();
    }
    initialize();
  }, []);

  const storyStateChange = () => {
    console.log("storyStateChange event fired");
    window.dispatchEvent(new Event('storyStateChangeEvent'));
  }
  
  const initFunction = async () => {
    await restartNewStory();
    window.isSketch = false;
    window.isSpeak = false;
    console.log('初始化函数被执行');
    let newImageUrl = './'+window.StoryState.storyIndex+'-'+window.StoryState.chapterIndex+'.png';
    updateBackgroundImage(newImageUrl);
    setImageUrl1(magicSketchpad);
    setImageUrl2(magicSketchpad);
    window.StoryState.chapterIndex += 1;
    storyIsInteract._storyIsInteract = false;
  };


  //button func
  const sketchPadRef = useRef(null);
  const [showSketchPad, setShowSketchPad] = useState(false);
  const [openSketchPad, setOpenSketchPad] = useState(false);
  const [sketchButtonStyle, setSketchButtonStyle] = useState(SketchButtonStyle);
  const [imageSrc, setImageSrc] = useState(magicSketchpad);
  const [imageUrl1, setImageUrl1] = useState(magicSketchpad);
  const [imageUrl2, setImageUrl2] = useState(magicSketchpad);

  function formatCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = ('0' + (now.getMonth() + 1)).slice(-2); // 加1是因为月份是从0开始的
    const day = ('0' + now.getDate()).slice(-2);
    const hours = ('0' + now.getHours()).slice(-2);
    const minutes = ('0' + now.getMinutes()).slice(-2);
    const seconds = ('0' + now.getSeconds()).slice(-2);
  
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  useEffect(() => {
    console.log('current'+sketchPadRef.current)
    if (!showSketchPad && sketchPadRef.current) {
      console.log('image save');
      const saveImgPath = window.StoryState.storyIndex
                + "_" + window.StoryState.chapterIndex
                + "_" + formatCurrentDateTime()
                + ".png";
      sketchPadRef.current.saveSketchPad(saveImgPath);
      if (window.sketches) {
        window.sketches.push(saveImgPath);
      } else {
        window.sketches = [saveImgPath];
      }
      
      downloadImageFromServer(saveImgPath)
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        if(window.StoryState.chapterIndex-1 == 1) {
          setImageUrl1(imageUrl);
        } else if(window.StoryState.chapterIndex-1 == 2) {
          setImageUrl2(imageUrl);
        }
      })
      .catch((error) => {
        console.error('Error downloading image:', error);
      });
      setOpenSketchPad(!openSketchPad);
    }

    const cleanup = () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };

    return () => {
      cleanup();
    };
  }, [showSketchPad]);

  const handleSketchButtonClick = () => {
    if(!window.isSpeakDown || window.isSketchDown) return;
    if(window.StoryState.chapterIndex > 3) return;
    if(storyIsInteract._storyIsInteract) return;
    if(showSketchPad && tempData._tempData === null) return;
    window.isSketch = !window.isSketch;
    setShowSketchPad(!showSketchPad);
    if(!openSketchPad) setOpenSketchPad(!openSketchPad);
    
    if (showSketchPad) {
      console.log('关闭画板');
      window.isSketchDown = true;
      setSketchButtonStyle({
        ...SketchButtonStyle,
        backgroundImage: 'url(./button2none.png)',
      });
      if(window.StoryState.chapterIndex <= 3) {
        console.log('sketchButton event fired')
        storyStateChange();
      }
    } else {
      if(window.StoryState.chapterIndex > 3) return;
      console.log('开启画板');
      setSketchButtonStyle({
        ...SketchButtonStyle,
        backgroundImage: 'url(./button2.png)',
      });
    }
  };

  const mediaRecorderRef = React.useRef(null);
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [speakButtonStyle, setSpeakButtonStyle] = useState(SpeakButtonStyle);
  

  const micRecorderRef = React.useRef(null);

  const handleSpeakButtonClick = () => {
    if(window.isSpeakDown) return;
    if(storyIsInteract._storyIsInteract) return;
    if(window.StoryState.chapterIndex >= 6) return;
    window.isSpeak = !window.isSpeak;

    if (!recording) {
      try {
        if (!micRecorderRef.current) {
          micRecorderRef.current = new MicRecorder({ bitRate: 128 });
        }
  
        micRecorderRef.current.start();
        console.log('开始录音');
  
        setRecording(true);
        setSpeakButtonStyle({
          ...SpeakButtonStyle,
          backgroundImage: 'url(./button1.png)',
        });
      } catch (error) {
        console.error('无法访问麦克风:', error);
      }
    } else {
        micRecorderRef.current.stop().getMp3().then(async ([buffer, blob]) => {
          console.log('录音结束，转换完成');
          console.log(blob);
          const file = new File(buffer, 'userAudio.mp3', {
            type: blob.type,
            lastModified: Date.now()
          });

          const response = await getVoice2Text(file);
          console.log('voice2text 服务器response:', response);
          console.log('服务器转换文字:', response.text);
          userm._userm = response.text;
          
          if(userm._userm === '') {
            console.log("ERROR: 语音转文字为空,允许再次录音")
            window.isSpeakDown = false;
          } else {
            window.isSpeakDown = true;
          }
          // Add ChapterIndex
          if(userm._userm !== '' && window.StoryState.chapterIndex < 3) {
            // sketchObj._sketchObj = await extractKeyword(userm._userm);
            // console.log('SketObj:'+sketchObj._sketchObj);
          }
          /**
           * 如果chapter index=1，2，则在此处生成故事，此刻用户在画图
           */
          if(userm._userm !== '' && window.StoryState.chapterIndex < 3) {
            window.StoryState.chapterIndex += 1;
            await updateStory(window.StoryState.storyIndex, window.StoryState.chapterIndex);
            console.log('speak 环节生成故事开始');
            tempData._tempData = null;
            tempData._tempData = await generateStory(window.StoryState.storyIndex, window.StoryState.chapterIndex, userm._userm);
            let cnt = 0;
            while((tempData._tempData === null || tempData._tempData.story === null || tempData._tempData.story === undefined) && cnt < 5) {
              console.log('故事2第'+cnt+'次尝试生成故事');
              tempData._tempData = await generateStory(window.StoryState.storyIndex, window.StoryState.chapterIndex, userm._userm);
              cnt++;
            }
            if(tempData._tempData === null || tempData._tempData.story === '' || tempData._tempData.story == undefined) {
              console.log("网络异常 llm接口失效")
              return;
            } else {
              console.log('speak 环节生成故事完成'+ tempData._tempData.story 
                + "\n" + tempData._tempData.interact);
            }
          } else if(window.StoryState.chapterIndex >= 3) {
            window.StoryState.chapterIndex += 1;
            storyStateChange();
          }
        }).catch((e) => {
          console.error('录音失败:', e);
        });
        setRecording(false);
        setSpeakButtonStyle({
          ...SpeakButtonStyle,
          backgroundImage: 'url(./button1none.png)',
        });
    }
  };

  const handleResume = async () => {
    // window.name = document.getElementById('test_name').value;
    // console.log("test name:"+window.name);
    // await setTesterName(window.name);
    // window.StoryState.chapterIndex += 1;
    // storyStateChange();
  }

  const handleReplayCurrentChapter =() => {
    // console.log("replay chapter");
    // updateStory(window.StoryState.storyIndex, window.StoryState.chapterIndex);
    // window.isSpeakDown = false;
    // window.isSketchDown = false;
    // if (tempData._tempData) {
    //   playSound(tempData._tempData);
    // }
  }

  const handleForwardBG = () => {
    const currentBG = backgroundImageUrl.split('?')[0].split('-');
    const currentIndex = parseInt(currentBG[currentBG.length - 1]);
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      const newImageUrl = `${currentBG[0]}-${prevIndex}.png?${new Date().getTime()}`;
      updateBackgroundImage(newImageUrl);
    }
  }

  const handleBackBG = () => {
    const currentBG = backgroundImageUrl.split('?')[0].split('-');
    const currentIndex = parseInt(currentBG[currentBG.length - 1]);
    const nextIndex = currentIndex + 1;
    if (nextIndex <= 3) {
      const newImageUrl = `${currentBG[0]}-${nextIndex}.png?${new Date().getTime()}`;
      updateBackgroundImage(newImageUrl);
    }
  }

  function changeStepColor(stepId) {
    console.log('stepid:'+stepId);
    for(var i = 1; i <= 4; i++) {
      document.getElementById('step-'+i).style.backgroundColor = '#e7e7e7';
    }
    const targetStep = document.getElementById('step-'+stepId);
    if (targetStep) {
      targetStep.style.backgroundColor = '#ff69b4';
    }
  }

  

  return (
      <Container fluid>
         <Row>
        <Col md={1} lg={1} xl={1} xxl={1}>
          <div style={{position: 'relative', width: '100%', height: '100%'}}>
            <div id="step-1" style={{...StepStyle, top: '10%'}}></div>
            <div id="step-2" style={{...StepStyle, top: '30%'}}></div>
            <div id="step-3" style={{...StepStyle, top: '50%'}}></div>
            <div id="step-4" style={{...StepStyle, top: '70%'}}></div>
            <div style={VerticalProgressStyle}>
              <div style={LineStyle}></div>
            </div>
          </div>
        </Col>
        
        <Col md={9} lg={9} xl={9} xxl={9}>
          <div id="storyBackground" style={DivBak} key={backgroundKey}>
            {/* <SketchPad visiable={showSketchPad} ref={sketchPadRef}/> */}
            {openSketchPad ? (
                <SketchPad ref={sketchPadRef} />
              ) : null}
          </div>
        </Col>
        
        <Col md={2} lg={2} xl={2} xxl={2}>
            {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}> */}
              <Button style={speakButtonStyle} onClick={handleSpeakButtonClick}/>
              <Button style={sketchButtonStyle} onClick={handleSketchButtonClick}/>
            {/* </div> */}
            <Form.Group style={StoryTextStyle}>
            {/* <Form.Control as="textarea" readOnly rows={3} value={textContent} /> */}
            <Image id="image1" src={imageUrl1} fluid rounded style={imageStyle} />
            <Image id="image2" src={imageUrl2} fluid rounded style={imageStyle} />
              {/*<Form.Control id="test_name" type="text" placeholder="输入你的名字" />*/}
            <Row>
            {/* <Button onClick={handleResume}>继续</Button> */}
            <Col>
              <Row>
                <Button onClick={handleReplayCurrentChapter} >重新生成</Button>
              </Row>
              <Row>
              <Col xs={6}>
                <Button onClick={handleForwardBG} style={{ width: '100%', backgroundColor: '#cccccc', color: '#333333' }}>前</Button>
              </Col>
              <Col xs={6}>
                <Button onClick={handleBackBG} style={{ width: '100%' , backgroundColor: '#cccccc', color: '#333333'}}>后</Button>
            </Col>
            </Row>
            </Col>
            </Row>
            <audio id="audioPlayer" controls style={{display: "none"}}></audio>
            </Form.Group>
        </Col>
      </Row>
      </Container>
    )
};
