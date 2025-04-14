import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ArrowRight, Loader2, AlertCircle, StopCircle, RotateCcw } from 'lucide-react';
import InterviewService, { InterviewQuestion, InterviewResult, InterviewEvaluation } from '../../services/InterviewService';
import SpeechRecognitionService from '../../services/SpeechRecognitionService';
import axios from 'axios';

interface InterviewSessionProps {
  onFinish?: (results: InterviewResult[]) => void;
}

const InterviewSession: React.FC<InterviewSessionProps> = ({ onFinish }) => {
  // State for the interview
  const [selectedTopic, setSelectedTopic] = useState<string>('JavaScript');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [interimResponse, setInterimResponse] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  
  // Refs
  const responseTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Topics for selection
  const topics = ["JavaScript", "Python", "Java", "C++", "React", "SQL", "System Design"];
  
  // Helper to capitalize the first letter of a string
  const capitalizeFirstLetter = useCallback((string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }, []);
  
  // Get default reference documentation URL based on topic
  const getDefaultReference = useCallback((topicId: string): string => {
    const references: Record<string, string> = {
      'javascript': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
      'python': 'https://docs.python.org/3/',
      'java': 'https://docs.oracle.com/en/java/',
      'cpp': 'https://en.cppreference.com/w/',
      'react': 'https://react.dev/reference/react',
      'sql': 'https://www.postgresql.org/docs/current/sql.html',
      'system_design': 'https://github.com/donnemartin/system-design-primer'
    };
    
    return references[topicId.toLowerCase()] || 'https://developer.mozilla.org/';
  }, []);
  
  // Generate questions using GROQ API
  const generateQuestionsWithGroq = useCallback(async (topicId: string, count: number = 5): Promise<InterviewQuestion[]> => {
    try {
      console.log(`Generating questions for ${topicId} using GROQ API`);
      
      // Define difficulty distribution
      const difficulties: ('Easy' | 'Medium' | 'Hard')[] = [];
      for (let i = 0; i < count; i++) {
        if (i < count * 0.4) difficulties.push('Easy');
        else if (i < count * 0.8) difficulties.push('Medium');
        else difficulties.push('Hard');
      }
      
      // Shuffle the difficulties
      difficulties.sort(() => Math.random() - 0.5);
      
      // GROQ API key
      const GROQ_API_KEY = "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";
      
      // Prepare prompt for GROQ API
      const prompt = `Generate ${count} unique technical interview questions about ${topicId}. Include a mix of difficulty levels.
      
      For each question:
      1. Provide a clear, in-depth technical question about ${topicId}
      2. Mention a documentation URL that's relevant to the question
      
      Format your response as a JSON array of objects with the following structure:
      [
        {
          "question": "The actual interview question text",
          "reference": "URL to relevant documentation"
        },
        ...
      ]
      
      Make each question unique, technical, and challenging. Focus on concepts that would be asked in real technical interviews.`;
      
      // Call GROQ API
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: "You are a technical interviewer who generates insightful interview questions. Generate questions in JSON format exactly as requested."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          }
        }
      );
      
      // Extract and process the JSON response
      const content = response.data.choices[0].message.content;
      console.log('GROQ API response content:', content);
      
      try {
        const parsedData = JSON.parse(content);
        const questionsArray = Array.isArray(parsedData) ? parsedData : parsedData.questions || [];
        
        // Map to our question format
        const questions: InterviewQuestion[] = questionsArray.map((item: any, index: number) => {
          return {
            id: `${topicId}-${Date.now()}-${index}`,
            question: item.question,
            difficulty: difficulties[index] || 'Medium',
            topic_area: capitalizeFirstLetter(topicId),
            expected_duration_sec: difficulties[index] === 'Easy' ? 90 : difficulties[index] === 'Medium' ? 150 : 210,
            reference: item.reference || getDefaultReference(topicId)
          };
        });
        
        console.log('Generated questions:', questions);
        return questions.slice(0, count);
      } catch (parseError) {
        console.error('Error parsing GROQ API response:', parseError, content);
        // Fallback to mock questions if parsing fails
        return InterviewService.getMockQuestions(topicId, count);
      }
    } catch (error) {
      console.error('Error generating questions with GROQ API:', error);
      // Fallback to mock questions
      return InterviewService.getMockQuestions(topicId, count);
    }
  }, [capitalizeFirstLetter, getDefaultReference]);
  
  // Load interview questions - defined with useCallback to avoid recreating it on each render
  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentQuestionIndex(0);
      setResults([]);
      setIsComplete(false);
      
      // Get questions using GROQ API
      const loadedQuestions = await generateQuestionsWithGroq(selectedTopic, 5);
      console.log("Loaded questions:", loadedQuestions); // Debug log
      
      if (loadedQuestions && loadedQuestions.length > 0) {
        setQuestions(loadedQuestions);
      } else {
        setError('No questions available for this topic. Please try another topic.');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setError('Failed to load interview questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTopic, generateQuestionsWithGroq]);
  
  // Toggle speech recognition - define with useCallback to avoid reference error
  const toggleRecording = useCallback(() => {
    if (!speechSupported) return;
    
    if (isRecording) {
      SpeechRecognitionService.stopListening();
    } else {
      SpeechRecognitionService.startListening();
    }
  }, [speechSupported, isRecording]);
  
  // Evaluate responses using GROQ API
  const evaluateWithGroq = useCallback(async (questionId: string, questionText: string, response: string): Promise<InterviewEvaluation> => {
    try {
      console.log(`Evaluating response for question ${questionId} using GROQ API`);
      
      // GROQ API key
      const GROQ_API_KEY = "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";
      
      // Prepare prompt for GROQ
      const prompt = `Evaluate this technical interview response based on the following criteria:
      
      Question: "${questionText}"
      
      Candidate Response: "${response}"
      
      Rate the response on a scale of 1-10 (where 10 is best) for:
      1. Correctness: Is the information technically accurate?
      2. Clarity: Is the explanation clear and understandable?
      3. Completeness: Does it cover all necessary aspects of the question?
      
      Then provide:
      1. An overall score (average of above)
      2. Detailed feedback on strengths and weaknesses 
      3. A model answer that would score 10/10
      
      Format your response as JSON with these keys exactly:
      {
        "correctness_score": number,
        "clarity_score": number,
        "completeness_score": number,
        "overall_score": number,
        "feedback": "string",
        "ideal_answer": "string"
      }`;
      
      // Call GROQ API
      const response2 = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: "You are a technical interviewer evaluating candidate responses. Be fair but thorough in your assessment."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          }
        }
      );
      
      // Extract the JSON response
      const content = response2.data.choices[0].message.content;
      console.log('GROQ evaluation response:', content);
      
      try {
        const evaluation = JSON.parse(content);
        return {
          overall_score: Number(evaluation.overall_score),
          correctness_score: Number(evaluation.correctness_score),
          clarity_score: Number(evaluation.clarity_score),
          completeness_score: Number(evaluation.completeness_score),
          feedback: evaluation.feedback,
          ideal_answer: evaluation.ideal_answer
        };
      } catch (parseError) {
        console.error('Error parsing GROQ evaluation response:', parseError);
        // Fallback to mock evaluation
        return InterviewService.getMockEvaluation(response);
      }
    } catch (error) {
      console.error('Error evaluating response with GROQ:', error);
      // Fallback to mock evaluation
      return InterviewService.getMockEvaluation(response);
    }
  }, []);
  
  // Submit response and move to next question - define with useCallback to avoid reference error
  const handleSubmitResponse = useCallback(async () => {
    if (isRecording) {
      SpeechRecognitionService.stopListening();
    }
    
    if (!currentResponse.trim()) {
      return; // Don't submit empty responses
    }
    
    // Early return if no questions are loaded or index is out of bounds
    if (!questions.length || currentQuestionIndex >= questions.length) {
      console.error('No questions loaded or invalid index');
      setError('Error: No questions available. Please restart the interview.');
      return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    
    try {
      setIsEvaluating(true);
      
      // Use GROQ to evaluate the response
      const evaluation = await evaluateWithGroq(currentQuestion.id, currentQuestion.question, currentResponse);
      console.log("Evaluation:", evaluation); // Debug log
      
      // Save the result
      const result: InterviewResult = {
        question: currentQuestion,
        response: currentResponse,
        evaluation
      };
      
      setResults(prev => [...prev, result]);
      
      // Clear current response
      setCurrentResponse('');
      setInterimResponse('');
      
      // Move to next question or complete the interview
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setIsComplete(true);
        if (onFinish) {
          onFinish([...results, result]);
        }
      }
    } catch (error) {
      console.error('Error evaluating response:', error);
      setError('Failed to evaluate your response. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  }, [currentResponse, currentQuestionIndex, questions, isRecording, results, onFinish, evaluateWithGroq]);
  
  // Handle response text change
  const handleResponseChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentResponse(e.target.value);
  }, []);
  
  // Restart the interview
  const restartInterview = useCallback(() => {
    setCurrentQuestionIndex(0);
    setCurrentResponse('');
    setInterimResponse('');
    setResults([]);
    setIsComplete(false);
    loadQuestions();
  }, [loadQuestions]);
  
  // Skip the current question
  const skipQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentResponse('');
      setInterimResponse('');
    }
  }, [currentQuestionIndex, questions.length]);
  
  // Configure speech recognition on mount
  useEffect(() => {
    const supported = SpeechRecognitionService.isSupported();
    setSpeechSupported(supported);
    
    if (supported) {
      SpeechRecognitionService.setCallbacks({
        onResult: (transcript, isFinal) => {
          if (isFinal) {
            setCurrentResponse(prev => prev + ' ' + transcript);
          } else {
            setInterimResponse(transcript);
          }
        },
        onError: (error) => {
          console.error('Speech recognition error:', error);
          setIsRecording(false);
        },
        onStart: () => {
          setIsRecording(true);
        },
        onEnd: () => {
          setIsRecording(false);
        }
      });
    }
  }, []);
  
  // Load questions when topic changes
  useEffect(() => {
    if (selectedTopic) {
      loadQuestions();
    }
  }, [selectedTopic, loadQuestions]);
  
  // Focus on textarea when recording starts
  useEffect(() => {
    if (responseTextareaRef.current) {
      responseTextareaRef.current.focus();
    }
  }, [isRecording]);
  
  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) {
        // Space to toggle recording when pressing Alt+Space
        if (e.code === 'Space' && e.altKey && !isEvaluating) {
          e.preventDefault();
          toggleRecording();
        }
        
        // Enter to submit when pressing Ctrl+Enter
        if (e.code === 'Enter' && e.ctrlKey && !isEvaluating && currentResponse.trim()) {
          e.preventDefault();
          handleSubmitResponse();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEvaluating, currentResponse, toggleRecording, handleSubmitResponse]);

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-50 overflow-hidden">
      {/* Header with title */}
      <div className="bg-indigo-500 text-white py-3 px-4 shadow-md">
        <h1 className="text-xl font-bold text-center">AI Technical Interview Practice</h1>
      </div>
      
      {/* Topic selection and controls */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <label htmlFor="topic-select" className="text-sm font-medium text-slate-700">
            Topic:
          </label>
          <select
            id="topic-select"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="rounded-md border-slate-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isLoading || isEvaluating}
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          
          <button
            onClick={restartInterview}
            className="ml-2 inline-flex items-center rounded-md border border-transparent bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            disabled={isLoading || isEvaluating}
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Restart
          </button>
        </div>
        
        {questions.length > 0 && (
          <div className="flex items-center">
            <span className="text-sm text-slate-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="w-36 h-2 bg-slate-200 rounded-full ml-2">
              <div 
                className="h-2 bg-indigo-600 rounded-full transition-all duration-300" 
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Main interview area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-600 text-lg">Preparing interview questions...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={loadQuestions}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-slate-600 text-lg mb-4">No questions loaded yet.</p>
            <button
              onClick={loadQuestions}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                'Start Interview'
              )}
            </button>
          </div>
        ) : isComplete ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Interview Complete!</h3>
              <p className="text-slate-600 text-lg mb-6">You've answered all the questions in this session.</p>
              <div className="flex justify-between">
                <button
                  onClick={restartInterview}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Start New Interview
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Question Header with Topic and Difficulty */}
              <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      {questions[currentQuestionIndex].difficulty}
                    </span>
                    <span className="ml-3 text-base text-slate-500">
                      {questions[currentQuestionIndex].topic_area}
                    </span>
                  </div>
                  <div className="text-base text-slate-500">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                </div>
              </div>
              
              {/* Question Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-xl font-medium text-slate-900 mb-3">
                      {questions[currentQuestionIndex].question}
                    </h3>
                    {questions[currentQuestionIndex].reference && (
                      <div className="text-base text-slate-500 mb-4">
                        <p>Reference: <a href={questions[currentQuestionIndex].reference} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{questions[currentQuestionIndex].reference}</a></p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                
                {/* Response Textarea */}
                <div className="mt-6">
                  <div className="mb-3 flex justify-between items-center">
                    <label htmlFor="response" className="block text-base font-medium text-slate-700">
                      Your Response:
                    </label>
                    {speechSupported && (
                      <button
                        type="button"
                        onClick={toggleRecording}
                        className={`inline-flex items-center rounded-md px-4 py-2 text-base font-medium transition-colors ${
                          isRecording 
                            ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        {isRecording ? <MicOff className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                      </button>
                    )}
                  </div>
                  
                  <div className="relative">
                    <textarea
                      id="response"
                      ref={responseTextareaRef}
                      value={currentResponse}
                      onChange={handleResponseChange}
                      rows={6}
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                      placeholder="Type your answer here..."
                      disabled={isEvaluating}
                    ></textarea>
                    
                    {interimResponse && isRecording && (
                      <div className="mt-2 text-base text-slate-500 italic">
                        {interimResponse}
                      </div>
                    )}
                    
                    <div className="mt-2 text-sm text-slate-500 flex justify-between">
                      <span>Press Alt+Space to toggle recording</span>
                      <span>Press Ctrl+Enter to submit</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={skipQuestion}
                    className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    disabled={isEvaluating}
                  >
                    Skip Question
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleSubmitResponse}
                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    disabled={isEvaluating || !currentResponse.trim()}
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        Submit Answer
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Debug info - for development purposes */}
            <div className="mt-6 border border-slate-200 rounded-md bg-white shadow-sm">
              <details className="group">
                <summary className="text-base font-medium text-slate-700 cursor-pointer p-3 hover:bg-slate-50 transition-colors flex items-center">
                  <span className="flex-1">Debug Information</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="p-3 border-t border-slate-200 text-sm text-slate-600 whitespace-pre-wrap bg-slate-50">
                  <p>Current Question Index: {currentQuestionIndex}</p>
                  <p>Total Questions: {questions.length}</p>
                  <p>Current Question: {JSON.stringify(questions[currentQuestionIndex], null, 2)}</p>
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewSession; 