import axios from 'axios';

// API base URL - can be configured based on environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// GROQ API key for generating unique questions
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

// Types for the interview API
export interface InterviewQuestion {
  id: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic_area: string;
  expected_duration_sec: number;
  reference?: string; // Optional URL for reference material
}

export interface InterviewEvaluation {
  overall_score: number;
  correctness_score: number;
  clarity_score: number;
  completeness_score: number;
  feedback: string;
  ideal_answer: string;
}

export interface InterviewResult {
  question: InterviewQuestion;
  response: string;
  evaluation: InterviewEvaluation;
}

export interface InterviewTopic {
  id: string;
  name: string;
  description: string;
}

class InterviewService {
  // Fetch available topics for interview
  async getTopics(): Promise<InterviewTopic[]> {
    try {
      const response = await axios.get(`${API_URL}/api/interview/topics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching interview topics:', error);
      
      // Fallback topics if API is not available
      return [
        { id: 'javascript', name: 'JavaScript', description: 'Core JavaScript concepts and modern ES6+ features' },
        { id: 'python', name: 'Python', description: 'Python programming fundamentals and advanced concepts' },
        { id: 'java', name: 'Java', description: 'Java programming and object-oriented concepts' },
        { id: 'cpp', name: 'C++', description: 'C++ programming and system-level concepts' },
        { id: 'react', name: 'React', description: 'React framework, hooks, and state management' },
        { id: 'sql', name: 'SQL', description: 'Database design and SQL query optimization' },
        { id: 'system_design', name: 'System Design', description: 'Architecture, scalability, and system design patterns' }
      ];
    }
  }

  // Fetch questions for a given topic
  async getQuestions(topicId: string, count: number = 5): Promise<InterviewQuestion[]> {
    try {
      // Try to fetch from backend API first
      const response = await axios.get(`${API_URL}/api/interview/questions`, {
        params: { topic: topicId, count }
      });
      return response.data;
    } catch (error) {
      console.log('Backend API not available, generating questions using GROQ API');
      // If API fails, generate questions using GROQ
      return this.generateQuestionsWithGroq(topicId, count);
    }
  }

  // Generate unique interview questions using GROQ AI API
  async generateQuestionsWithGroq(topicId: string, count: number = 5): Promise<InterviewQuestion[]> {
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
            topic_area: this.capitalizeFirstLetter(topicId),
            expected_duration_sec: difficulties[index] === 'Easy' ? 90 : difficulties[index] === 'Medium' ? 150 : 210,
            reference: item.reference || this.getDefaultReference(topicId)
          };
        });
        
        console.log('Generated questions:', questions);
        return questions.slice(0, count);
      } catch (parseError) {
        console.error('Error parsing GROQ API response:', parseError, content);
        // Fallback to mock questions if parsing fails
        return this.getMockQuestions(topicId, count);
      }
    } catch (error) {
      console.error('Error generating questions with GROQ API:', error);
      // Fallback to mock questions
      return this.getMockQuestions(topicId, count);
    }
  }
  
  // Helper to capitalize the first letter of a string
  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  // Get default reference documentation URL based on topic
  getDefaultReference(topicId: string): string {
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
  }

  // Submit a response for evaluation
  async evaluateResponse(questionId: string, response: string): Promise<InterviewEvaluation> {
    try {
      // Try the backend API first
      const result = await axios.post(`${API_URL}/api/interview/evaluate`, {
        question_id: questionId,
        response
      });
      return result.data;
    } catch (error) {
      console.error('Error evaluating response via API:', error);
      console.log('Using GROQ for evaluation instead');
      
      // If backend API fails, use GROQ to evaluate
      return this.evaluateWithGroq(questionId, response);
    }
  }
  
  // Evaluate responses using GROQ API
  async evaluateWithGroq(questionId: string, response: string): Promise<InterviewEvaluation> {
    try {
      console.log(`Evaluating response for question ${questionId} using GROQ API`);
      
      // Parse the topic and question from the questionId
      const parts = questionId.split('-');
      const topic = parts[0];
      
      // Get the original question text - try to find it from mock questions first
      let questionText = "";
      const mockQuestions = this.getMockQuestions(topic);
      const foundQuestion = mockQuestions.find(q => q.id === questionId);
      
      if (foundQuestion) {
        questionText = foundQuestion.question;
      } else {
        // If questionId not found in mock questions, extract it from the ID
        questionText = `Question about ${topic}`;
      }
      
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
        return this.getMockEvaluation(response);
      }
    } catch (error) {
      console.error('Error evaluating response with GROQ:', error);
      // Fallback to mock evaluation
      return this.getMockEvaluation(response);
    }
  }

  // Submit all responses at once for batch evaluation
  async submitInterview(responses: { questionId: string, response: string }[]): Promise<InterviewResult[]> {
    try {
      const result = await axios.post(`${API_URL}/api/interview/submit`, { responses });
      return result.data;
    } catch (error) {
      console.error('Error submitting interview:', error);
      throw new Error('Failed to submit your interview. Please try again later.');
    }
  }

  // For development/testing purposes - generates mock questions
  getMockQuestions(topicId: string, count: number = 5): InterviewQuestion[] {
    console.log(`Generating mock questions for topic: ${topicId}, count: ${count}`);
    
    const mockQuestions: Record<string, InterviewQuestion[]> = {
      javascript: [
        {
          id: 'js-1',
          question: 'Explain closures in JavaScript and provide an example of where they might be useful.',
          difficulty: 'Medium',
          topic_area: 'JavaScript',
          expected_duration_sec: 120,
          reference: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures'
        },
        {
          id: 'js-2',
          question: 'Describe the difference between let, const, and var in JavaScript.',
          difficulty: 'Easy',
          topic_area: 'JavaScript',
          expected_duration_sec: 90,
          reference: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let'
        },
        {
          id: 'js-3',
          question: 'Explain how promises work in JavaScript and how they help with asynchronous operations.',
          difficulty: 'Medium',
          topic_area: 'JavaScript',
          expected_duration_sec: 150,
          reference: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise'
        },
        {
          id: 'js-4',
          question: 'What is the event loop in JavaScript and how does it handle asynchronous operations?',
          difficulty: 'Hard',
          topic_area: 'JavaScript',
          expected_duration_sec: 180,
          reference: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop'
        },
        {
          id: 'js-5',
          question: 'Explain prototypal inheritance in JavaScript and how it differs from classical inheritance.',
          difficulty: 'Hard',
          topic_area: 'JavaScript',
          expected_duration_sec: 180,
          reference: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain'
        }
      ],
      react: [
        {
          id: 'react-1',
          question: 'Explain the difference between state and props in React components.',
          difficulty: 'Easy',
          topic_area: 'React',
          expected_duration_sec: 90,
          reference: 'https://react.dev/learn/passing-props-to-a-component'
        },
        {
          id: 'react-2',
          question: 'What are React hooks and why were they introduced?',
          difficulty: 'Medium',
          topic_area: 'React',
          expected_duration_sec: 120,
          reference: 'https://react.dev/reference/react/hooks'
        },
        {
          id: 'react-3',
          question: 'Explain the concept of lifting state up in React. When and why would you use it?',
          difficulty: 'Medium',
          topic_area: 'React',
          expected_duration_sec: 150,
          reference: 'https://react.dev/learn/sharing-state-between-components'
        },
        {
          id: 'react-4',
          question: 'Describe the virtual DOM in React and how it helps with performance.',
          difficulty: 'Medium',
          topic_area: 'React',
          expected_duration_sec: 120,
          reference: 'https://legacy.reactjs.org/docs/faq-internals.html'
        },
        {
          id: 'react-5',
          question: 'Explain React\'s Context API and when you would use it instead of prop drilling or a state management library.',
          difficulty: 'Hard',
          topic_area: 'React',
          expected_duration_sec: 180,
          reference: 'https://react.dev/learn/passing-data-deeply-with-context'
        }
      ],
      // Other topics can be added similarly
    };

    // Return questions for the specified topic, or a default set if topic not found
    const questions = mockQuestions[topicId] || mockQuestions.javascript;
    const result = questions.slice(0, count);
    
    console.log(`Returning ${result.length} mock questions:`, result);
    return result;
  }

  // For development/testing purposes - generates mock evaluation
  getMockEvaluation(response: string): InterviewEvaluation {
    console.log(`Generating mock evaluation for response of length: ${response.length}`);
    
    // Simple mock logic - longer answers tend to get better scores
    const length = response.length;
    const randomVariation = (Math.random() * 2) - 1; // -1 to +1
    
    const baseScore = Math.min(8, 3 + (length / 100));
    const overallScore = Math.min(10, Math.max(1, baseScore + randomVariation));
    
    const correctnessScore = Math.min(10, Math.max(1, overallScore + (Math.random() * 2 - 1)));
    const clarityScore = Math.min(10, Math.max(1, overallScore + (Math.random() * 2 - 1)));
    const completenessScore = Math.min(10, Math.max(1, overallScore + (Math.random() * 2 - 1)));

    const evaluation = {
      overall_score: Number(overallScore.toFixed(1)),
      correctness_score: Number(correctnessScore.toFixed(1)),
      clarity_score: Number(clarityScore.toFixed(1)),
      completeness_score: Number(completenessScore.toFixed(1)),
      feedback: 'This is mock feedback for development purposes. Your answer was ' + 
                (overallScore > 7 ? 'excellent' : overallScore > 5 ? 'good' : 'needs improvement') + 
                '. Consider expanding on key concepts and providing more concrete examples.',
      ideal_answer: 'This is a placeholder for an ideal answer to this question. In a real implementation, this would provide a comprehensive explanation of the topic with examples and best practices.'
    };
    
    console.log('Returning mock evaluation:', evaluation);
    return evaluation;
  }
}

export default new InterviewService(); 