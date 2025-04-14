import React from 'react';
import { ArrowLeft, Mic, Volume2, BrainCircuit, CheckCircle, Book, MessageSquare, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MockInterviewHelp: React.FC = () => {
  const steps = [
    {
      icon: <Book className="h-6 w-6 text-indigo-500" />,
      title: "Select a Topic",
      description: "Choose from a variety of programming languages and technologies to practice your interview skills."
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-indigo-500" />,
      title: "Answer Questions",
      description: "Our AI will ask you relevant technical interview questions that mimic real-world scenarios."
    },
    {
      icon: <Mic className="h-6 w-6 text-indigo-500" />,
      title: "Voice Recognition",
      description: "Answer naturally using your voice - our system will convert your speech to text in real-time."
    },
    {
      icon: <BrainCircuit className="h-6 w-6 text-indigo-500" />,
      title: "AI Analysis",
      description: "Your responses are analyzed by our AI to provide detailed feedback on your technical knowledge."
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-indigo-500" />,
      title: "Get Evaluated",
      description: "Receive a comprehensive score with specific feedback on strong points and areas for improvement."
    }
  ];

  const tips = [
    "Speak clearly and at a moderate pace for best voice recognition results",
    "When answering, structure your response with an introduction, main points, and conclusion",
    "If you're not sure about a question, it's okay to ask for clarification",
    "Always explain your thought process, especially for coding or algorithm questions",
    "Mention time and space complexity considerations for algorithm questions",
    "Practice common questions beforehand, but be ready to think on your feet"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link 
            to="/interview-prep" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Interview Practice
          </Link>
        </div>

        <div className="text-center mb-16">
          <motion.h1 
            className="text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            How to Use the AI Technical Interview Assistant
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered interview assistant helps you prepare for technical interviews with real-time feedback and personalized recommendations.
          </p>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Zap className="mr-3 h-6 w-6 text-indigo-500" />
            How It Works
          </h2>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3">
                  {step.icon}
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">
                    Step {index + 1}: {step.title}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Volume2 className="mr-3 h-6 w-6" />
            Pro Tips for Better Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <motion.div 
                key={index}
                className="flex items-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex-shrink-0 h-6 w-6 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {index + 1}
                </div>
                <p className="ml-3 text-indigo-100">
                  {tip}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">How accurate is the voice recognition?</h3>
              <p className="mt-2 text-gray-600">
                Our voice recognition system is highly accurate but works best in quiet environments. Speak clearly and at a moderate pace for optimal results.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Can I use this for non-technical interviews?</h3>
              <p className="mt-2 text-gray-600">
                The current version is optimized for technical interviews, specifically for software development roles. We plan to expand to other fields in the future.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">How is my performance evaluated?</h3>
              <p className="mt-2 text-gray-600">
                Your responses are analyzed based on technical accuracy, completeness, clarity, and relevant concepts covered. The AI compares your answers against expected key points for each question.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Can I save my interview results?</h3>
              <p className="mt-2 text-gray-600">
                Yes, after completing an interview session, you can save your results and access them later from your profile. This helps you track your progress over time.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Link to="/interview-prep">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start Practicing Now
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewHelp; 