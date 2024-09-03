// App.js
import React from 'react';
import StoryPage from './StoryPage'; // 确保路径正确
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChoosePage from './Choosepage';
import {Button, Navbar, Nav, Container} from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';
import SketchPad from './SketchPad';
import { restartNewStory } from './util';
import PaintPage from './PaintPage';
import ParentPage from './ParentPage';

// Add this global variable
export let backgroundImages = [
  '1-0.png',
  '1-1.png',
  '1-2.png',
  '1-3.png'
];

export let scenesPromptGlobal = [
  'a',
  'b',
  'c',
  'd'
];

let appData1 = {};

Object.defineProperty(appData1, 'userm', {
  get: function() {
    return this._userm;
  },
  set: function(value) {
    this._userm = value;
  },
  enumerable: true,
  configurable: true
});

export { appData1 as userm };

let appData2 = {};

Object.defineProperty(appData2, 'p5RefGlobal', {
  get: function() {
    return this._p5Ref;
  },
  set: function(value) {
    this._p5Ref = value;
  },
  enumerable: true,
  configurable: true
});

export { appData2 as p5RefGlobal };

let appData3 = {};

Object.defineProperty(appData3, 'sketchObj', {
  get: function() {
    return this._sketchObj;
  },
  set: function(value) {
    this._sketchObj = value;
  },
  enumerable: true,
  configurable: true
});

export { appData3 as sketchObj };

let appData4 = {};

Object.defineProperty(appData3, 'tempData', {
  get: function() {
    return this._tempData;
  },
  set: function(value) {
    this._tempData = value;
  },
  enumerable: true,
  configurable: true
});

export { appData4 as tempData };

let appData5 = {};

Object.defineProperty(appData5, 'storyIsInteract', {
  get: function() {
    return this._storyIsInteract;
  },
  set: function(value) {
    this._storyIsInteract = value;
  },
  enumerable: true,
  configurable: true
});

export { appData5 as storyIsInteract };

let appData6 = {};

Object.defineProperty(appData6, 'extractBackgroundPrompt', {
  get: function() {
    return this._extractBackgroundPrompt;
  },
  set: function(value) {
    this._extractBackgroundPrompt = value;
  },
  enumerable: true,
  configurable: true
});

export { appData6 as extractBackgroundPrompt };

let appData7 = {};

Object.defineProperty(appData7, 'scensUrl', {
  get: function() {
    return this._scensUrl;
  },
  set: function(value) {
    this._scensUrl = value;
  },
  enumerable: true,
  configurable: true
});

export { appData7 as scensUrl };

let appData8 = {};

Object.defineProperty(appData8, 'characterPrompt', {
  get: function() {
    return this._characterPrompt;
  },
  set: function(value) {
    this._characterPrompt = value;
  },
  enumerable: true,
  configurable: true
});

export { appData8 as characterPrompt };

let appData9 = {};

Object.defineProperty(appData9, 'splitStoryText', {
  get: function() {
    return this._splitStoryText;
  },
  set: function(value) {
    this._splitStoryText = value;
  },
  enumerable: true,
  configurable: true
});

export { appData9 as splitStoryText };

function StoryParkNavbar() {
  const navigate = useNavigate(); // 正确地在组件内部使用useNavigate

  const brandStyle = {
    color: 'black',
    fontSize: '24px',
    fontWeight: 'bold',
    marginRight: 'auto',
  };

  const navbarStyle = {
    height: '80px',
    backgroundColor: '#d0c8ff',
    marginBottom: '0px',
  };

  const center_nav_links = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    color: 'white',
  }

  const chooseButtonStyle = {
    backgroundColor: 'transparent',
    backgroundImage: 'url(./choose.png)',
    border: 'none',
    width: '90px',
    height: '40px',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    marginRight: '10px',
    marginLeft: '10px',
  }

  const createButtonStyle = {
    backgroundColor: 'transparent',
    backgroundImage: 'url(./create.png)',
    border: 'none',
    width: '90px',
    height: '40px',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    marginRight: '10px',
    marginLeft: '10px',
  }

  const restartButtonStyle = {
    backgroundColor: 'transparent',
    backgroundImage: 'url(./start.png)',
    border: 'none',
    width: '40px',
    height: '40px',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    marginRight: '5px',
    marginLeft: '5px',
  }

  const noteButtonStyle = {
    backgroundColor: 'transparent',
    backgroundImage: 'url(./note.png)',
    border: 'none',
    width: '90px',
    height: '40px',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    marginRight: '5px',
    marginLeft: '5px',
  }

  const backToChoosePage = () => {
    restartNewStory();
    navigate('/');
  }
  const restartStory = async () => {
    await restartNewStory();
    window.StoryState.chapterIndex = 0;
    console.log("story index:"+window.StoryState.storyIndex+", chapter index:"+window.StoryState.chapterIndex)
    window.dispatchEvent(new Event('storyStateChangeEvent'));
  }
  
  return (
    <Navbar bg="purple-light" expand="lg" style={navbarStyle}>
      <Container fluid>
        <Navbar.Brand href="#home" style={brandStyle}>AI-Story Park</Navbar.Brand>
        <Button style={chooseButtonStyle} onClick={backToChoosePage}/>
        <Button style={restartButtonStyle} onClick={restartStory}/>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <div style={center_nav_links}>
          <Button onClick={() => navigate('/')} style={{ marginRight: '10px', marginLeft: '20px' }}>情节共创</Button>
          <Button onClick={() => navigate('/PaintPage')}>情景理解</Button>
        </div>
        <Button style={createButtonStyle} />
        <Button style={noteButtonStyle} />
        
      </Container>
    </Navbar>
  );
}


function App() {
  return (
    <Router>
    <StoryParkNavbar />
    <Routes>
      <Route path="/" element={<ParentPage />} />
      {/* <Route path="/choose-page" element={<ChoosePage />} /> */}
      <Route path="/StoryPage" element={<StoryPage />} />
      <Route path="/PaintPage" element={<PaintPage />} />
      <Route path="/ParentPage" element={<ParentPage />} />
    </Routes>
    </Router>
  );
}

export default App;