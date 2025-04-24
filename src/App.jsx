import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlanDetailPage from './pages/PlanDetailPage';
import NavBar from './components/common/NavBar';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/plan/:id' element={<PlanDetailPage />} />
      </Routes>
    </Router>
  );
};

export default App;
