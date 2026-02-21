import { useState } from 'react';

export async function generateQuizFromContent(content, apiKey, numQuestions = 5) {
  const prompt = `
You are a quiz generator. Based on the following content, create ${numQuestions} multiple-choice questions.

Content:
${content.substring(0, 3000)}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]

Rules:
- correctAnswer is the index (0-3) of the correct option
- Make questions challenging but fair
- Ensure options are distinct and plausible
- Cover different aspects of the content
- Return ONLY the JSON array, no other text
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse quiz questions from response');
    }

    const questions = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid quiz format');
    }

    const validQuestions = questions.filter(q => 
      q.question && 
      Array.isArray(q.options) && 
      q.options.length === 4 &&
      typeof q.correctAnswer === 'number' &&
      q.correctAnswer >= 0 &&
      q.correctAnswer < 4
    );

    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated');
    }

    return validQuestions;

  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
}

export function parseQuizCommand(message) {
  const quizPattern = /^\/(quiz|test)(\s+(\d+))?/i;
  const match = message.match(quizPattern);
  
  if (match) {
    const numQuestions = parseInt(match[3]) || 5;
    return {
      isQuizCommand: true,
      numQuestions: Math.min(numQuestions, 10)
    };
  }
  
  return null;
}

export function generateSampleQuiz() {
  return [
    {
      question: "What is the capital of France?",
      options: ["London", "Paris", "Berlin", "Madrid"],
      correctAnswer: 1
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Jupiter", "Mars", "Saturn"],
      correctAnswer: 2
    },
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: 1
    },
    {
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
      correctAnswer: 1
    },
    {
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
      correctAnswer: 3
    }
  ];
}

export function useQuizGenerator(apiKey) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateQuiz = async (content, numQuestions = 5) => {
    setIsGenerating(true);
    setError(null);

    try {
      if (!content || content.trim().length < 50) {
        return generateSampleQuiz().slice(0, numQuestions);
      }

      const questions = await generateQuizFromContent(content, apiKey, numQuestions);
      return questions;
    } catch (err) {
      setError(err.message);
      return generateSampleQuiz().slice(0, numQuestions);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateQuiz,
    isGenerating,
    error
  };
}