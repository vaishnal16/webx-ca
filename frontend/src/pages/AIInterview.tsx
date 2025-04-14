import React, { useState } from 'react';
import InterviewSession from '../components/AIInterview/InterviewSession';
import InterviewResults from '../components/AIInterview/InterviewResults';
import { InterviewResult } from '../services/InterviewService';

const AIInterview: React.FC = () => {
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);

  const handleInterviewFinish = (interviewResults: InterviewResult[]) => {
    setResults(interviewResults);
    setIsInterviewComplete(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-indigo-900 mb-8">
          AI Technical Interview Practice
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {!isInterviewComplete ? (
            <div className="h-[70vh]">
              <InterviewSession onFinish={handleInterviewFinish} />
            </div>
          ) : (
            <div className="h-[70vh]">
              <InterviewResults results={results} />
              <div className="p-4 text-center">
                <button
                  onClick={() => setIsInterviewComplete(false)}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Start New Interview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInterview; 