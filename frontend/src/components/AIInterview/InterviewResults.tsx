import React from 'react';
import { InterviewResult } from '../../services/InterviewService';
import { ChevronDown, ChevronUp, Check, X, AlertCircle } from 'lucide-react';

interface InterviewResultsProps {
  results: InterviewResult[];
}

const InterviewResults: React.FC<InterviewResultsProps> = ({ results }) => {
  const [expandedQuestions, setExpandedQuestions] = React.useState<Record<number, boolean>>({});
  
  // Toggle expanded state for a question
  const toggleExpanded = (index: number) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Calculate overall performance metrics
  const calculatePerformance = () => {
    if (!results.length) return null;
    
    let totalScore = 0;
    let correctnessSum = 0;
    let claritySum = 0;
    let completenessSum = 0;
    
    results.forEach(result => {
      totalScore += result.evaluation.overall_score;
      correctnessSum += result.evaluation.correctness_score;
      claritySum += result.evaluation.clarity_score;
      completenessSum += result.evaluation.completeness_score;
    });
    
    const avgScore = totalScore / results.length;
    const avgCorrectness = correctnessSum / results.length;
    const avgClarity = claritySum / results.length;
    const avgCompleteness = completenessSum / results.length;
    
    return {
      avgScore,
      avgCorrectness,
      avgClarity,
      avgCompleteness
    };
  };
  
  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Format score for display
  const formatScore = (score: number) => {
    return score.toFixed(1);
  };
  
  // Performance metrics
  const performance = calculatePerformance();
  
  if (!results.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Interview Results</h3>
          <p className="mt-2 text-sm text-gray-500">
            Complete an interview to see your performance analysis.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Performance summary */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Summary</h2>
        
        {performance && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className={`text-3xl font-bold ${getScoreColor(performance.avgScore)}`}>
                {formatScore(performance.avgScore)}
              </div>
              <div className="text-sm text-gray-500 mt-1">Overall Score</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className={`text-3xl font-bold ${getScoreColor(performance.avgCorrectness)}`}>
                {formatScore(performance.avgCorrectness)}
              </div>
              <div className="text-sm text-gray-500 mt-1">Correctness</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className={`text-3xl font-bold ${getScoreColor(performance.avgClarity)}`}>
                {formatScore(performance.avgClarity)}
              </div>
              <div className="text-sm text-gray-500 mt-1">Clarity</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className={`text-3xl font-bold ${getScoreColor(performance.avgCompleteness)}`}>
                {formatScore(performance.avgCompleteness)}
              </div>
              <div className="text-sm text-gray-500 mt-1">Completeness</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Questions and responses */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Feedback</h3>
          
          {results.map((result, index) => (
            <div 
              key={`result-${index}`}
              className="bg-white shadow-sm rounded-lg mb-4 overflow-hidden border border-gray-200"
            >
              <div 
                className="p-4 bg-white flex items-start justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpanded(index)}
              >
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <div className="flex-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                        {result.question.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">
                        {result.question.topic_area}
                      </span>
                    </div>
                    <div className={`text-lg font-semibold ${getScoreColor(result.evaluation.overall_score)}`}>
                      {formatScore(result.evaluation.overall_score)}
                    </div>
                  </div>
                  <h4 className="text-base font-medium text-gray-900">
                    {result.question.question}
                  </h4>
                </div>
                <div className="ml-4">
                  {expandedQuestions[index] ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              {expandedQuestions[index] && (
                <div className="px-4 pb-4">
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Your Response:</h5>
                    <div className="bg-gray-50 rounded p-3 text-sm text-gray-600 whitespace-pre-wrap">
                      {result.response}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-500">Correctness</span>
                        <span className={`text-sm font-semibold ${getScoreColor(result.evaluation.correctness_score)}`}>
                          {formatScore(result.evaluation.correctness_score)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-indigo-600 h-1.5 rounded-full" 
                          style={{ width: `${(result.evaluation.correctness_score / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-500">Clarity</span>
                        <span className={`text-sm font-semibold ${getScoreColor(result.evaluation.clarity_score)}`}>
                          {formatScore(result.evaluation.clarity_score)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-indigo-600 h-1.5 rounded-full" 
                          style={{ width: `${(result.evaluation.clarity_score / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-500">Completeness</span>
                        <span className={`text-sm font-semibold ${getScoreColor(result.evaluation.completeness_score)}`}>
                          {formatScore(result.evaluation.completeness_score)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-indigo-600 h-1.5 rounded-full" 
                          style={{ width: `${(result.evaluation.completeness_score / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Feedback:</h5>
                    <div className="bg-gray-50 rounded p-3 text-sm text-gray-600">
                      {result.evaluation.feedback}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Sample Answer:</h5>
                    <div className="bg-gray-50 rounded p-3 text-sm text-gray-600 whitespace-pre-wrap">
                      {result.evaluation.ideal_answer}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterviewResults; 