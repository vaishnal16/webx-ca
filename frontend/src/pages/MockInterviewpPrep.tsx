import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Mic, Code, PenTool, CheckCircle, BookOpen, BrainCircuit, DownloadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import InterviewPerformance from '../components/InterviewPerformance';

const MockInterviewPrep: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('interview');

  // Simulate iframe loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: <Mic size={20} />,
      title: 'Voice Recognition',
      description: 'Answer questions naturally using your voice'
    },
    {
      icon: <BrainCircuit size={20} />,
      title: 'AI Evaluation',
      description: 'Get instant feedback on your answers'
    },
    {
      icon: <BookOpen size={20} />,
      title: 'Diverse Topics',
      description: 'Practice across multiple programming domains'
    },
    {
      icon: <DownloadCloud size={20} />,
      title: 'Save Progress',
      description: 'Track your performance over time'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold">AI Technical Interview Assistant</h1>
              <p className="mt-2 text-indigo-100">
                Practice technical interviews with our AI assistant and get instant feedback
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Link to="/mock-interview-help">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Headphones className="mr-2 h-5 w-5" />
                  How It Works
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-800 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PenTool className="mr-2 h-5 w-5" />
                View Past Results
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Interactive Area */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('interview')}
                  className={`px-6 py-4 text-sm font-medium flex items-center ${
                    activeTab === 'interview'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Interview Session
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`px-6 py-4 text-sm font-medium flex items-center ${
                    activeTab === 'results'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Performance
                </button>
              </div>

              {/* Content */}
              <div className="h-[calc(100vh-300px)] relative">
                {activeTab === 'interview' && (
                  <>
                    {isLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
                        <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600">Loading interview assistant...</p>
                      </div>
                    )}
                    <iframe
                      src="http://localhost:8502"
                      className="w-full h-full border-0"
                      title="Streamlit UI"
                      style={{ visibility: isLoading ? 'hidden' : 'visible' }}
                    ></iframe>
                  </>
                )}
                
                {activeTab === 'results' && (
                  <InterviewPerformance />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Info Panel */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Code className="mr-2 h-5 w-5 text-indigo-600" />
                Interview Tips
              </h3>
              <ul className="mt-4 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-indigo-600">1</span>
                    </div>
                  </div>
                  <p className="ml-3 text-sm text-gray-600">Speak clearly and articulate your thoughts step by step</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-indigo-600">2</span>
                    </div>
                  </div>
                  <p className="ml-3 text-sm text-gray-600">Explain your approach before diving into implementation details</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-indigo-600">3</span>
                    </div>
                  </div>
                  <p className="ml-3 text-sm text-gray-600">Consider time and space complexity in your solutions</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-indigo-600">4</span>
                    </div>
                  </div>
                  <p className="ml-3 text-sm text-gray-600">Ask clarifying questions when a problem seems ambiguous</p>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div className="mt-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold">Key Features</h3>
              <div className="mt-4 space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 mt-1 bg-white/20 rounded-lg p-1.5">
                      {feature.icon}
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium">{feature.title}</h4>
                      <p className="mt-1 text-xs text-indigo-100">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewPrep;
