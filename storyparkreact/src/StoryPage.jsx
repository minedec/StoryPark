import React, { useState, useEffect, useRef } from 'react';
import SketchPad from './SketchPad.jsx';
import './util.js'
import { generateStory, updateStory, sendAudioFile, getText2Voice, getVoice2Text, playSound } from './util.js';
import {Container, Col, Row, Button, Form} from 'react-bootstrap'
import MicRecorder from 'mic-recorder-to-mp3';
import {userm} from './App.js'

export default function StoryPage() {

  const DivBak = {
    backgroundColor: 'transparent',
    backgroundImage: 'url(./background1.png)',
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

  const [textContent, setTextContent] = useState('这是初始文本内容');
  const updateTextContent = (newText) => {
    setTextContent(newText);
  };

  const handleStoryInteract = async () => {
    if(window.StoryState.chapterIndex === 1) {
      console.log('这是故事1的场景1');
      // const response = await generateStory('hello');
      // console.log(response);
      // const audioUrl = await getText2Voice(response.story + response.interact);
      // console.log('audioUrl '+ audioUrl);
      // if (audioUrl) {
      //   playSound(audioUrl);
      // }
      window.isSpeakDown = false;
      window.isSketchDown = false;
    } else if (window.StoryState.chapterIndex === 2) {
      if(!window.isSpeakDown || !window.isSketchDown) return;
      console.log('这是故事1的场景2');
      console.log('此处生成故事并播放，story:'+window.StoryState.storyIndex+',chapter:'+window.StoryState.chapterIndex);
      // const response = await generateStory(userm._userm);
      // console.log(response);
      // const audioUrl = await getText2Voice(response.story + response.interact);
      // console.log('audioUrl '+ audioUrl);
      // if (audioUrl) {
      //   playSound(audioUrl);
      // }
      window.isSpeakDown = false;
      window.isSketchDown = false;
    } else if(window.StoryState.chapterIndex === 3) {
      if(!window.isSpeakDown || !window.isSketchDown) return;
      console.log('这是故事1的场景3');
      console.log('此处生成故事结尾并播放到问题，story:'+window.StoryState.storyIndex+',chapter:'+window.StoryState.chapterIndex);
      // const response = await generateStory(userm._userm);
      // console.log(response);
      // const audioUrl = await getText2Voice(response.story + response.Q1);
      // console.log('audioUrl '+ audioUrl);
      // if (audioUrl) {
      //   playSound(audioUrl);
      // }
      window.isSpeakDown = false;
      window.isSketchDown = false;
    } else if(window.StoryState.chapterIndex >= 4) {
      if(window.StoryState.chapterIndex == 6) {
        console.log('这是故事1的场景6');
        console.log('此处生成问题反馈并播放下一个问题，story:'+window.StoryState.storyIndex+',chapter:'+window.StoryState.chapterIndex);
        updateStory(window.StoryState.storyIndex, 4);
        // const response = await generateStory(userm._userm);
        // console.log(response);
        // const audioUrl = await getText2Voice(response.guidance);
        // console.log('audioUrl '+ audioUrl);
        // if (audioUrl) {
        //   playSound(audioUrl);
        // }
        // story end
        console.log('这是故事收尾');
        updateStory(window.StoryState.storyIndex, 5);
        // response = await generateStory(userm._userm);
        // console.log(response);
        // audioUrl = await getText2Voice(response.guidance);
        // console.log('audioUrl '+ audioUrl);
        // if (audioUrl) {
        //   playSound(audioUrl);
        // }
        return;
      }
      console.log('这是故事1的场景4');
      console.log('此处生成问题反馈并播放下一个问题，story:'+window.StoryState.storyIndex+',chapter:'+window.StoryState.chapterIndex);
      updateStory(window.StoryState.storyIndex, 4);
      // const response = await generateStory(userm._userm);
      // console.log(response);
      // const audioUrl = await getText2Voice(response.guidance + response.interact);
      // console.log('audioUrl '+ audioUrl);
      // if (audioUrl) {
      //   playSound(audioUrl);
      // }
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
    storyStateChange();
  };


  //button func
  const sketchPadRef = useRef(null);
  const [showSketchPad, setShowSketchPad] = useState(false);
  const [sketchButtonStyle, setSketchButtonStyle] = useState(SketchButtonStyle);

  useEffect(() => {
    if (!showSketchPad && sketchPadRef.current) {
      sketchPadRef.current.clearSketchPad();
    }
  }, [showSketchPad]);

  const handleSketchButtonClick = () => {
    window.isSketch = !window.isSketch;
    setShowSketchPad(!showSketchPad);
    
    if (showSketchPad) {
      console.log('关闭画板');
      window.isSketchDown = true;
      setSketchButtonStyle({
        ...SketchButtonStyle,
        backgroundImage: 'url(./button2none.png)',
      });
      storyStateChange();
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
          window.StoryState.chapterIndex += 1;
          storyStateChange();
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
            {showSketchPad ? (
                <SketchPad ref={sketchPadRef} />
              ) : null}
          </div>
        </Col>
        
        <Col md={2} lg={2}>
            <Button style={speakButtonStyle} onClick={handleSpeakButtonClick}/>
            <Button style={sketchButtonStyle} onClick={handleSketchButtonClick}/>
            <Form.Group controlId="exampleForm.ControlInput1" style={StoryTextStyle}>
            <Form.Control as="textarea" readOnly rows={3} value={textContent} />
            <audio id="audioPlayer" controls style={{display: "none"}}></audio>
      </Form.Group>
        </Col>
      </Row>
      </Container>
    )
};
