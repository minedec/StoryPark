import React from 'react';
import { useNavigate } from 'react-router-dom';
import {Button, Navbar, Nav, Container} from 'react-bootstrap'
import { restartNewStory } from './util';

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

  const goToStoryPage = (storyIndex) => {
    window.StoryState.storyIndex = storyIndex;
    window.StoryState.chapterIndex = 0;
    navigate('/ParentPage');
  };

  return (
    <div className="choose-page">
      <div style={DivBak}>
        <Button style={Story1ButtonStyle} onClick={() => goToStoryPage(1)}></Button>
        <Button style={Story2ButtonStyle} onClick={() => goToStoryPage(2)}></Button>
        <Button style={Story3ButtonStyle} onClick={() => goToStoryPage(3)}></Button>
      </div>
    </div>
  );
}


export default ChoosePage;

