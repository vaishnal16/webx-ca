import React from 'react';
import { PieChart, BarChart2, Users, Award, ArrowUpRight, Lightbulb, Check, X } from 'lucide-react';

// Define TypeScript interfaces for our component
interface PerformanceMetric {
  name: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface FeedbackItem {
  type: 'positive' | 'negative';
  text: string;
}

interface InterviewPerformanceProps {
  performance?: {
    overallScore: number;
    questionResults: Array<{
      question: string;
      score: number;
      keyPointsCovered: string[];
      missingConcepts: string[];
      feedback: string;
    }>;
  };
  isLoading?: boolean;
}

const InterviewPerformance: React.FC<InterviewPerformanceProps> = ({ 
  performance = {
    overallScore: 76,
    questionResults: [
      {
        question: "Explain how React's virtual DOM works and its benefits.",
        score: 85,
        keyPointsCovered: [
          "Lightweight copy of the actual DOM",
          "Diffing algorithm",
          "Batch updates"
        ],
        missingConcepts: [
          "Reconciliation process",
          "Performance optimizations"
        ],
        feedback: "Good explanation of the virtual DOM concept. Consider elaborating on how React decides which components to re-render."
      },
      {
        question: "What are closures in JavaScript and how would you use them?",
        score: 72,
        keyPointsCovered: [
          "Function bundled with its lexical environment",
          "Access to outer function's variables"
        ],
        missingConcepts: [
          "Memory management considerations",
          "Practical use cases"
        ],
        feedback: "You explained the basic concept well but could provide more concrete examples of practical applications."
      },
      {
        question: "Explain the differences between REST and GraphQL.",
        score: 68,
        keyPointsCovered: [
          "GraphQL's single endpoint",
          "Data fetching differences"
        ],
        missingConcepts: [
          "REST's resource-based approach",
          "Caching considerations",
          "Error handling differences"
        ],
        feedback: "Your comparison covered some key points, but you might want to explore more deeply how each handles state management and versioning."
      },
    ]
  },
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="w-12 h-12 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-3 text-slate-600">Loading performance data...</p>
      </div>
    );
  }

  if (!performance || performance.questionResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="bg-indigo-50 rounded-full p-4 mb-4">
          <Users className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Interview Data</h3>
        <p className="text-slate-600 max-w-md">
          You haven't completed any interview sessions yet. Start a new interview to see your performance metrics.
        </p>
      </div>
    );
  }

  // Performance metrics for display
  const metrics: PerformanceMetric[] = [
    { 
      name: 'Overall Score', 
      value: performance.overallScore, 
      icon: <Award className="h-4 w-4" />,
      color: 'bg-green-50 text-green-600'
    },
    { 
      name: 'Technical Accuracy', 
      value: Math.round(performance.questionResults.reduce((sum, q) => sum + q.score, 0) / performance.questionResults.length), 
      icon: <Check className="h-4 w-4" />,
      color: 'bg-blue-50 text-blue-600' 
    },
    { 
      name: 'Response Quality', 
      value: performance.overallScore > 75 ? 82 : 68, 
      icon: <BarChart2 className="h-4 w-4" />,
      color: 'bg-purple-50 text-purple-600' 
    },
    { 
      name: 'Improvement Trend', 
      value: 12, 
      icon: <ArrowUpRight className="h-4 w-4" />,
      color: 'bg-indigo-50 text-indigo-600' 
    }
  ];

  // Format the feedback items
  const formatFeedback = (question: typeof performance.questionResults[0]): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];
    
    // Add positive feedback for covered points
    question.keyPointsCovered.forEach(point => {
      feedback.push({
        type: 'positive',
        text: point
      });
    });
    
    // Add negative feedback for missing concepts
    question.missingConcepts.forEach(concept => {
      feedback.push({
        type: 'negative',
        text: concept
      });
    });
    
    return feedback;
  };

  // Calculate score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 65) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="h-full bg-slate-50 p-4">
      {/* Summary Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
          <PieChart className="mr-2 h-4 w-4 text-indigo-600" />
          Performance Summary
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm hover:shadow transition-shadow">
              <div className={`${metric.color} rounded-full w-8 h-8 flex items-center justify-center mb-2`}>
                {metric.icon}
              </div>
              <div className="text-xs text-slate-500">{metric.name}</div>
              <div className="text-xl font-bold mt-1">
                {metric.name === 'Improvement Trend' ? `+${metric.value}%` : `${metric.value}%`}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Question Performance */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <Lightbulb className="mr-2 h-4 w-4 text-indigo-600" />
          Question Breakdown
        </h2>
        
        <div className="space-y-5">
          {performance.questionResults.map((questionResult, index) => (
            <div key={index} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-medium text-slate-900 pr-4">{questionResult.question}</h3>
                <div className={`text-base font-bold ${getScoreColor(questionResult.score)}`}>
                  {questionResult.score}%
                </div>
              </div>
              
              {/* Feedback List */}
              <div className="mb-3">
                <h4 className="text-xs font-medium text-slate-700 mb-2">Key Points Analysis:</h4>
                <div className="space-y-1.5 pl-1">
                  {formatFeedback(questionResult).map((item, i) => (
                    <div key={i} className="flex items-start">
                      <div className={`flex-shrink-0 mt-0.5 ${
                        item.type === 'positive' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {item.type === 'positive' ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </div>
                      <p className={`ml-2 text-xs ${
                        item.type === 'positive' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Feedback */}
              <div className="bg-indigo-50 rounded-lg p-3">
                <h4 className="text-xs font-medium text-indigo-800 mb-1">Interviewer Feedback:</h4>
                <p className="text-xs text-indigo-700">{questionResult.feedback}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterviewPerformance; 