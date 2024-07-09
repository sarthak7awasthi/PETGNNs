
import { BrowserRouter as Router, Route, Routes  } from 'react-router-dom'
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Visualizations from './pages/Visualizations';
function App() {
  return (
   


<Router>

        <Routes>
          <Route exact path="/" element={<Signup/>}/>
        
          <Route exact path="/login" element={<Login/>}/>
          <Route exact path="/dashboard" element={<Dashboard/>}/>
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/projects/:id/visualizations" element={<Visualizations />} />

        
        </Routes>

    </Router>
  );
}

export default App;
