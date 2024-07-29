// App.js
import React from 'react';
import StoryPage from './StoryPage'; // 确保路径正确
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChoosePage from './Choosepage';
import {Button, Navbar, Nav, Container} from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';
import SketchPad from './SketchPad';
import { restartNewStory } from './util';

let appData = {};

Object.defineProperty(appData, 'userm', {
  get: function() {
    return this._userm;
  },
  set: function(value) {
    this._userm = value;
  },
  enumerable: true,
  configurable: true
});

export { appData as userm };

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
    navigate('/choose-page');
  }
  const restartStory = () => {
    restartNewStory();
    window.StoryState.chapterIndex = 1;
    window.dispatchEvent(new Event('storyStateChange'));
  }
  
  return (
    <Navbar bg="purple-light" expand="lg" style={navbarStyle}>
      <Container fluid>
        <Navbar.Brand href="#home" style={brandStyle}>AI-Story Park</Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <div style={center_nav_links}>
          <Nav className='me-auto'>
            <Nav.Link href="#plots">情节共创</Nav.Link>
            <Nav.Link href="#scenarios">情景理解</Nav.Link>
          </Nav>
        </div>
        <Button style={chooseButtonStyle} onClick={backToChoosePage}/>
        <Button style={createButtonStyle} />
        <Button style={noteButtonStyle} />
        <Button style={restartButtonStyle} onClick={restartStory}/>
      </Container>
    </Navbar>
  );
}


function App() {
  return (
    <Router>
    <StoryParkNavbar />
    <Routes>
      <Route path="/" element={<ChoosePage />} />
      <Route path="/choose-page" element={<ChoosePage />} />
      <Route path="/StoryPage" element={<StoryPage />} />
    </Routes>
    </Router>
  );
}

export default App;