import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Project from './pages/Project';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/project/:id' element={<Project />} />
      </Routes>
    </Router>
  );
};

export default App;
