// App.js
import React from 'react';
import StoryPage1 from './StoryPage1'; // 确保路径正确
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChoosePage from './Choosepage';

function App() {
  console.log("start app")
  return (
    <Router>
    <div className='App'>
       <ChoosePage />
    </div>
    <Routes>
      {/* <Route path="/Story1" element={<Story1 />} /> */}
      <Route path="/" element={<ChoosePage />} />
      <Route path="/StoryPage1" element={<StoryPage1 />} />
      {/* <Route path="/StoryPage2" element={<StoryPage2 />} /> */}
      {/* <Route path="/StoryPage3" element={<StoryPage3 />} /> */}
      <Route path="/choose" element={<ChoosePage />} />
    </Routes>
  </Router>

  );
}

export default App;





// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return ( //记得放括号，只能有一个div，但可以用空标签包起来，注意 /> 结尾做标签闭合
//   <>
//     <div className="App">
//       <header className="App-header"> 
//         <img src={logo} className="App-logo" alt="logo" /> 

//       </header>
//     </div> 
//   </>
//   );
// }

// export default App;
