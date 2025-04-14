import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import RoadmapPage from './pages/RoadmapPage';
import Authpages from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import InterviewPrep from './pages/InterviewPrep';
import ResumeBuilder from './pages/ResumeBuilder';
import MockInterviewPrep from './pages/MockInterviewpPrep';
import MockInterviewHelp from './pages/MockInterviewHelp';
import AIInterview from './pages/AIInterview';

export default function App() {
  return (
    <>
   <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Authpages />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
          />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/exam-prep" element={<InterviewPrep />} />
        <Route path="/resume" element={<ResumeBuilder />} />
        <Route path="/interview-prep" element={<MockInterviewPrep />} />
        <Route path="/mock-interview-help" element={<MockInterviewHelp />} />
        <Route path="/ai-interview" element={<AIInterview />} />
      </Routes>
    </Router> 
    </>
  )
}
