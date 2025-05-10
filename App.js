import React from 'react';
import { Home } from './Pages/Home';
import { Login } from './Pages/Login';
import { CreatePost } from './create-form/CreatePost';
import { Navbar } from './Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (

    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/createpost" element={<CreatePost />} />
      </Routes>
    </Router>
  );
}

export default App;
