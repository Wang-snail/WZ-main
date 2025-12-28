import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MinimalTest from './pages/MinimalTest';

function AppMinimal() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MinimalTest />} />
        <Route path="/test" element={<MinimalTest />} />
        <Route path="*" element={<MinimalTest />} />
      </Routes>
    </Router>
  );
}

export default AppMinimal;