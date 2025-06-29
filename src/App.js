import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 

import Home from './assets/pages/Home.jsx'; 
import Quiz from './assets/pages/Quiz.jsx'; 
import TableView from './assets/pages/TableView.jsx';  

function App() {
  return (
    <Router>  
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />  
        <Route path="/table" element={<TableView />} />  
      </Routes>
    </Router>
  );
}

export default App;
