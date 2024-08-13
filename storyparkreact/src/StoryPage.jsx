import React, { useState, useEffect, useRef } from 'react';
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
  setTesterName
} from './util.js';
import {Container, Col, Row, Button, Form, Image, Stack } from 'react-bootstrap'
import MicRecorder from 'mic-recorder-to-mp3';
import {userm, sketchObj, tempData} from './App.js'
import magicSketchpad from './assets/white-background.png';

export default function StoryPage() {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(magicSketchpad);
  
  const updateBackgroundImage = (newImageUrl) => {
    console.log('update backimage:' + newImageUrl)
    setBackgroundImageUrl(newImageUrl);
  };

  const DivBak = {
    backgroundColor: 'transparent',
    backgroundImage: `url(${backgroundImageUrl})`,
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
    width: '110px',
    height: '120px',
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

  window.is_interact = false;
  const handleStoryInteract = async () => {
    if(window.StoryState.chapterIndex === 1) {
      if(window.is_interact) return;
      window.is_interact = true;
      console.log('这是故事1的场景1');
      changeStepColor(window.StoryState.chapterIndex);
      const response = await generateStory('hello');
      console.log(response);
      const audioUrl = await getText2Voice(response.story + response.interact);
      tempData._tempData = audioUrl;
      console.log('audioUrl '+ audioUrl);
      if (audioUrl) {
        //playSound(audioUrl);
      }
      let newImageUrl = './'+window.StoryState.storyIndex+'-'+window.StoryState.chapterIndex+'.png';
      updateBackgroundImage(newImageUrl);
      window.isSpeakDown = false;
      window.isSketchDown = false;
      window.is_interact = false;
    } else if (window.StoryState.chapterIndex === 2) {
      if(window.is_interact) return;
      if(!window.isSpeakDown || !window.isSketchDown) return;
      window.is_interact = true;
      console.log('这是故事1的场景2');
      console.log('此处生成故事并播放，story:'+window.StoryState.storyIndex+',chapter:'+window.StoryState.chapterIndex);
      changeStepColor(window.StoryState.chapterIndex);
      const response = await generateStory(userm._userm);
      console.log(response);
      const audioUrl = await getText2Voice(response.story + response.interact);
      tempData._tempData = audioUrl;
      console.log('audioUrl '+ audioUrl);
      let newImageUrl = './'+window.StoryState.storyIndex+'-'+window.StoryState.chapterIndex+'.png';
      updateBackgroundImage(newImageUrl);
      if (audioUrl) {
        //playSound(audioUrl);
      }
      window.isSpeakDown = false;
      window.isSketchDown = false;
      window.is_interact = false;
    } else if(window.StoryState.chapterIndex === 3) {
      if(window.is_interact) return;
      if(!window.isSpeakDown || !window.isSketchDown) return;
      window.is_interact = true;
      console.log('这是故事1的场景3');
      console.log('此处生成故事结尾并播放到问题，story:'+window.StoryState.storyIndex+',chapter:'+window.StoryState.chapterIndex);
      changeStepColor(window.StoryState.chapterIndex);
      const response = await generateStory(userm._userm);
      console.log(response);
      const audioUrl = await getText2Voice(response.story + response.Q1);
      tempData._tempData = audioUrl;
      console.log('audioUrl '+ audioUrl);
      let newImageUrl = './'+window.StoryState.storyIndex+'-'+window.StoryState.chapterIndex+'.png';
      updateBackgroundImage(newImageUrl);
      if (audioUrl) {
        //playSound(audioUrl);
      }
      window.isSpeakDown = false;
      window.isSketchDown = false;
      window.is_interact = false;
    } else if(window.StoryState.chapterIndex >= 4) {
      if(window.is_interact) return;
      window.is_interact = true;
      if(window.StoryState.chapterIndex == 6) {
        console.log('这是故事收尾');
        changeStepColor(4);
        updateStory(window.StoryState.storyIndex, 5);
        const response = await generateStory(userm._userm);
        console.log(response);
        const audioUrl = await getText2Voice(response.interact);
        tempData._tempData = audioUrl; 
        console.log('audioUrl '+ audioUrl);
        if (audioUrl) {
          //playSound(audioUrl);
        }
        return;
      }
      console.log('这是故事1的场景4');
      console.log('此处生成问题反馈并播放下一个问题，story:'+window.StoryState.storyIndex+',chapter:'+window.StoryState.chapterIndex);
      changeStepColor(4);
      updateStory(window.StoryState.storyIndex, 4);
      const response = await generateStory(userm._userm);
      console.log(response);
      const audioUrl = await getText2Voice(response.guidance + response.interact);
      tempData._tempData = audioUrl;
      console.log('audioUrl '+ audioUrl);
      if (audioUrl) {
        //playSound(audioUrl);
      }
      window.is_interact = false;
    }
  };

  useEffect(() => {
      // 监听 window.StoryState 的变化
    const handleStoryStateChange = async () => {
      console.log('storyIndex or chapterIndex changed');
      updateStory(window.StoryState.storyIndex, window.StoryState.chapterIndex);
      updateTextContent(`story${window.StoryState.storyIndex}chapter${window.StoryState.chapterIndex}`);
      if(window.StoryState.chapterIndex === 0) {
        initFunction();
      }
      await handleStoryInteract();
    };

    // 添加事件监听器
    window.addEventListener('storyStateChange', handleStoryStateChange);
    initFunction();
  }, []);

  const storyStateChange = () => {
    console.log("storyStateChange event fired");
    window.dispatchEvent(new Event('storyStateChange'));
  }
  
  const initFunction = () => {
    window.isSketch = false;
    window.isSpeak = false;
    console.log('初始化函数被执行');
    let newImageUrl = './'+window.StoryState.storyIndex+'-'+window.StoryState.chapterIndex+'.png';
    updateBackgroundImage(newImageUrl);
    setImageUrl1(magicSketchpad);
    setImageUrl2(magicSketchpad);
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
      console.log('enter save');
      const saveImgPath = window.name
                + "_" + window.StoryState.storyIndex
                + "_" + window.StoryState.chapterIndex
                + "_" + formatCurrentDateTime()
                + ".png";
      sketchPadRef.current.saveSketchPad(saveImgPath);
      
      downloadImageFromServer(saveImgPath)
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        if(window.StoryState.chapterIndex == 1) {
          setImageUrl1(imageUrl);
        } else if(window.StoryState.chapterIndex == 2) {
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
    } else {
      if(window.StoryState.chapterIndex > 3) return;
      console.log('开启画板');
      window.isSketchDown = false;
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
    console.log('SpeakButton clicked');
    window.isSpeak = !window.isSpeak;

    if (!recording) {
      try {
        window.isSpeakDown = false;

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
          console.log('服务器转换文字:', response.text);
          userm._userm = response.text;
          window.isSpeakDown = true;
          // Add ChapterIndex
          if(window.StoryState.chapterIndex <= 3) {
            sketchObj._sketchObj = await extractKeyword(userm._userm);
            console.log('SketObj:'+sketchObj._sketchObj);
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
    window.name = document.getElementById('test_name').value;
    console.log("test name:"+window.name);
    await setTesterName(window.name);
    window.StoryState.chapterIndex += 1;
    storyStateChange();
  }

  const handleReplayCurrentChapter =() => {
    console.log("replay chapter");
    updateStory(window.StoryState.storyIndex, window.StoryState.chapterIndex);
    window.isSpeakDown = false;
    window.isSketchDown = false;
    if (tempData._tempData) {
      playSound(tempData._tempData);
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
          <div id="storyBackground" style={DivBak}>
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
              <Form.Control id="test_name" type="text" placeholder="输入你的名字" />
            <Row>
            <Button onClick={handleResume}>继续</Button>
            <Button onClick={handleReplayCurrentChapter} >重播</Button>
            </Row>
            <audio id="audioPlayer" controls style={{display: "none"}}></audio>
            </Form.Group>
        </Col>
      </Row>
      </Container>
    )
};
