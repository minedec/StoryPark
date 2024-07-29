import React from 'react';
import { useNavigate } from 'react-router-dom';
import {Button, Navbar, Nav, Container} from 'react-bootstrap'

window.StoryState = {
  storyIndex: 0,
  chapterIndex: 0,
}
function ChoosePage() {
  const DivBak = {
    backgroundColor: 'transparent',
    backgroundImage: 'url(./chooseground.png)',
    backgroundSize: 'cover',
    height: '90vh',
    maxWidth: '100vw',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }

  const Story1ButtonStyle = {
    backgroundColor: 'transparent',
    backgroundImage: 'url(./story1.png)',
    border: 'none',
    width: '150px',
    height: '150px',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    position: 'absolute',
    top: '40%',
    left: '20%',
    transform: 'translate(-50%, -50%)',
  }

  const Story2ButtonStyle = {
    backgroundColor: 'transparent',
    backgroundImage: 'url(./story2.png)',
    border: 'none',
    width: '150px',
    height: '150px',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    position: 'absolute',
    top: '50%',
    left: '70%',
    transform: 'translate(-50%, -50%)',
  }

  const Story3ButtonStyle = {
    backgroundColor: 'transparent',
    backgroundImage: 'url(./story3.png)',
    border: 'none',
    width: '150px',
    height: '150px',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    position: 'absolute',
    top: '80%',
    left: '40%',
    transform: 'translate(-50%, -50%)',
  }


  const navigate = useNavigate(); // 正确地在组件内部使用useNavigate

  const goToStoryPage1 = () => {
    window.StoryState.storyIndex = 1;
    window.StoryState.chapterIndex = 1;
    navigate('/StoryPage'); // 假设你的路由设置中定义了'/StoryPage1'
  };
  const goToStoryPage2 = () => {
    window.StoryState.storyIndex = 2;
    window.StoryState.chapterIndex = 1;
    navigate('/StoryPage'); // 假设你的路由设置中定义了'/StoryPage2'
  };
  const goToStoryPage3 = () => {
    window.StoryState.storyIndex = 3;
    window.StoryState.chapterIndex = 1;
    navigate('/StoryPage'); // 假设你的路由设置中定义了'/StoryPage3'
  };

  return (
    <div className="choose-page">
      <div style={DivBak}>
        <Button style={Story1ButtonStyle} onClick={goToStoryPage1}></Button>
        <Button style={Story2ButtonStyle} onClick={goToStoryPage2}></Button>
        <Button style={Story3ButtonStyle} onClick={goToStoryPage3}></Button>
      </div>
    </div>
  );
}


export default ChoosePage;

