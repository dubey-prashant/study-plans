import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Plan from './pages/Plan';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/plan/:id' element={<Plan />} />
      </Routes>
    </Router>
  );
};

export default App;
