import React, { useState, useEffect, useRef } from 'react';
import SketchPad from './SketchPad.jsx';
import './util.js'
import { generateStory, updateStory, sendAudioFile, getText2Voice, getVoice2Text, playSound, extractKeyword, downloadImageFromServer, drawbackContext} from './util.js';
import {Container, Col, Row, Button, Form, Image} from 'react-bootstrap'
import MicRecorder from 'mic-recorder-to-mp3';
import {userm, sketchObj, tempData} from './App.js'
import magicSketchpad from './assets/magic-sketchpad.jpg';

export default function StoryPage() {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('./background1.png');
  
  const updateBackgroundImage = (newImageUrl) => {
    console.log(newImageUrl)
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
    width: '120px',
    height: '160px',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    top: '15%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }

  const SketchButtonStyle = {
    backgroundColor: 'transparent',
    backgroundImage: 'url(./button2none.png)',
    border: 'none',
    width: '120px',
    height: '150px',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    top: '20%',
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
  }

  const [textContent, setTextContent] = useState('这是初始文本内容');
  const updateTextContent = (newText) => {
    setTextContent(newText);
  };

  const handleStoryInteract = async () => {
    if(window.StoryState.chapterIndex === 1) {
      console.log('这是故事1的场景1');
      const response = await generateStory('hello');
      console.log(response);
      const audioUrl = await getText2Voice(response.story + response.interact);
      tempData._tempData = audioUrl;
      console.log('audioUrl '+ audioUrl);
      if (audioUrl) {
        playSound(audioUrl);
      }
      let newImageUrl = './'+window.StoryState.storyIndex+'-'+window.StoryState.chapterIndex+'.png';
      updateBackgroundImage(newImageUrl);
      window.isSpeakDown = false;
      window.isSketchDown = false;
    } else if (window.StoryState.chapterIndex === 2) {
      if(!window.isSpeakDown || !window.isSketchDown) return;
      console.log('这是故事1的场景2');
      console.log('此处生成故事并播放，story:'+window.StoryState.storyIndex+',chapter:'+window.StoryState.chapterIndex);
      const response = await generateStory(userm._userm);
      console.log(response);
      const audioUrl = await getText2Voice(response.story + response.interact);
      tempData._tempData = audioUrl;
      console.log('audioUrl '+ audioUrl);
      let newImageUrl = './'+window.StoryState.storyIndex+'-'+window.StoryState.chapterIndex+'.png';
      updateBackgroundImage(newImageUrl);
      if (audioUrl) {
        playSound(audioUrl);
      }
      window.isSpeakDown = false;
      window.isSketchDown = false;
    } else if(window.StoryState.chapterIndex === 3) {
      if(!window.isSpeakDown || !window.isSketchDown) return;
      console.log('这是故事1的场景3');
      console.log('此处生成故事结尾并播放到问题，story:'+window.StoryState.storyIndex+',chapter:'+window.StoryState.chapterIndex);
      const response = await generateStory(userm._userm);
      console.log(response);
      const audioUrl = await getText2Voice(response.story + response.Q1);
      tempData._tempData = audioUrl;
      console.log('audioUrl '+ audioUrl);
      let newImageUrl = './'+window.StoryState.storyIndex+'-'+window.StoryState.chapterIndex+'.png';
      updateBackgroundImage(newImageUrl);
      if (audioUrl) {
        playSound(audioUrl);
      }
      window.isSpeakDown = false;
      window.isSketchDown = false;
    } else if(window.StoryState.chapterIndex >= 4) {
      if(window.StoryState.chapterIndex == 6) {
        console.log('这是故事收尾');
        updateStory(window.StoryState.storyIndex, 5);
        const response = await generateStory(userm._userm);
        console.log(response);
        const audioUrl = await getText2Voice(response.interact);
        tempData._tempData = audioUrl; 
        console.log('audioUrl '+ audioUrl);
        if (audioUrl) {
          playSound(audioUrl);
        }
        return;
      }
      console.log('这是故事1的场景4');
      console.log('此处生成问题反馈并播放下一个问题，story:'+window.StoryState.storyIndex+',chapter:'+window.StoryState.chapterIndex);
      updateStory(window.StoryState.storyIndex, 4);
      const response = await generateStory(userm._userm);
      console.log(response);
      const audioUrl = await getText2Voice(response.guidance + response.interact);
      tempData._tempData = audioUrl;
      console.log('audioUrl '+ audioUrl);
      if (audioUrl) {
        playSound(audioUrl);
      }
    }
  };

  useEffect(() => {
      // 监听 window.StoryState 的变化
    const handleStoryStateChange = async () => {
      console.log('storyIndex or chapterIndex changed');
      updateStory(window.StoryState.storyIndex, window.StoryState.chapterIndex);
      updateTextContent(`story${window.StoryState.storyIndex}chapter${window.StoryState.chapterIndex}`);
      await handleStoryInteract();
    };

    // 添加事件监听器
    window.addEventListener('storyStateChange', handleStoryStateChange);
    initFunction();
  }, []);

  const storyStateChange = () => {
    window.dispatchEvent(new Event('storyStateChange'));
  }
  
  const initFunction = () => {
    window.isSketch = false;
    window.isSpeak = false;
    console.log('初始化函数被执行');
    let newImageUrl = './'+window.StoryState.storyIndex+'-'+window.StoryState.chapterIndex+'.png';
    updateBackgroundImage(newImageUrl);
  };


  //button func
  const sketchPadRef = useRef(null);
  const [showSketchPad, setShowSketchPad] = useState(false);
  const [openSketchPad, setOpenSketchPad] = useState(false);
  const [sketchButtonStyle, setSketchButtonStyle] = useState(SketchButtonStyle);
  const [imageSrc, setImageSrc] = useState(magicSketchpad);

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
      const saveImgPath = window.StoryState.storyIndex
                + "_" + window.StoryState.chapterIndex
                + "_" + formatCurrentDateTime()
                + ".png";
      sketchPadRef.current.saveSketchPad(saveImgPath);
      
      downloadImageFromServer(saveImgPath)
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setImageSrc(imageUrl);
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
          sketchObj._sketchObj = await extractKeyword(userm._userm);
          console.log('SketObj:'+sketchObj._sketchObj);
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

  const handleResume = () => {
    window.StoryState.chapterIndex += 1;
    storyStateChange();
  }

  const handleReplayCurrentChapter =() => {
    console.log("replay chapter");
    // window.StoryState.chapterIndex -=1;
    // drawbackContext(1);
    updateStory(window.StoryState.storyIndex, window.StoryState.chapterIndex);
    window.isSpeakDown = false;
    window.isSketchDown = false;
    if (tempData._tempData) {
      playSound(tempData._tempData);
    }
  }

  return (
      <Container fluid>
         <Row>
        <Col md={1} lg={1}>
          <div style={{position: 'relative', width: '100%', height: '100%'}}>
            <div style={{...StepStyle, top: '10%'}}></div>
            <div style={{...StepStyle, top: '30%'}}></div>
            <div style={{...StepStyle, top: '50%'}}></div>
            <div style={{...StepStyle, top: '70%'}}></div>
            <div style={VerticalProgressStyle}>
              <div style={LineStyle}></div>
            </div>
          </div>
        </Col>
        
        <Col md={9} lg={9}>
          <div id="storyBackground" style={DivBak}>
            {/* <SketchPad visiable={showSketchPad} ref={sketchPadRef}/> */}
            {openSketchPad ? (
                <SketchPad ref={sketchPadRef} />
              ) : null}
          </div>
        </Col>
        
        <Col md={2} lg={2}>
            <Button style={speakButtonStyle} onClick={handleSpeakButtonClick}/>
            <Button style={sketchButtonStyle} onClick={handleSketchButtonClick}/>
            <Form.Group controlId="exampleForm.ControlInput1" style={StoryTextStyle}>
            <Form.Control as="textarea" readOnly rows={3} value={textContent} />
            <Image src={imageSrc} fluid rounded style={imageStyle} />
            <Form.Group controlId="formBasicText">
              <Form.Control type="text" placeholder="Enter text" />
            </Form.Group>
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