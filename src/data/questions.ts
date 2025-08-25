import { SpeakingQuestion } from '../types/index';

export const speakingQuestions: SpeakingQuestion[] = [
  // Business Category
  {
    id: 'biz-1',
    category: 'business',
    difficulty: 'beginner',
    question: 'Describe your ideal work environment in 2 minutes.',
    context: 'You\'re in a job interview and the hiring manager asks about your work preferences.',
    timeLimit: 120,
    tips: ['Be specific about what motivates you', 'Mention both physical and cultural aspects', 'Connect to the company\'s values']
  },
  {
    id: 'biz-2',
    category: 'business',
    difficulty: 'intermediate',
    question: 'Explain how you would handle a difficult client who is never satisfied.',
    context: 'You\'re in a team meeting discussing client management strategies.',
    timeLimit: 180,
    tips: ['Show empathy first', 'Present a structured approach', 'Emphasize communication and follow-up']
  },
  {
    id: 'biz-3',
    category: 'business',
    difficulty: 'advanced',
    question: 'Present a business case for implementing AI in your company\'s customer service.',
    context: 'You\'re pitching to the executive board for budget approval.',
    timeLimit: 300,
    tips: ['Start with the problem', 'Present data and ROI', 'Address concerns proactively']
  },

  // Personal Category
  {
    id: 'personal-1',
    category: 'personal',
    difficulty: 'beginner',
    question: 'Tell us about a hobby that brings you joy.',
    context: 'You\'re at a social gathering meeting new people.',
    timeLimit: 90,
    tips: ['Show genuine enthusiasm', 'Include a brief story', 'Connect it to your personality']
  },
  {
    id: 'personal-2',
    category: 'personal',
    difficulty: 'intermediate',
    question: 'Describe a challenge you overcame and what you learned from it.',
    context: 'You\'re in a personal development workshop.',
    timeLimit: 150,
    tips: ['Be honest about the struggle', 'Focus on the learning', 'Show growth mindset']
  },
  {
    id: 'personal-3',
    category: 'personal',
    difficulty: 'advanced',
    question: 'Share your philosophy on work-life balance and how you implement it.',
    context: 'You\'re mentoring a younger colleague.',
    timeLimit: 240,
    tips: ['Define your own terms', 'Give practical examples', 'Acknowledge challenges']
  },

  // Academic Category
  {
    id: 'academic-1',
    category: 'academic',
    difficulty: 'beginner',
    question: 'Explain the concept of climate change in simple terms.',
    context: 'You\'re presenting to a high school science class.',
    timeLimit: 120,
    tips: ['Use analogies', 'Avoid jargon', 'Make it relatable']
  },
  {
    id: 'academic-2',
    category: 'academic',
    difficulty: 'intermediate',
    question: 'Compare and contrast two different economic systems.',
    context: 'You\'re in a college economics seminar.',
    timeLimit: 180,
    tips: ['Use concrete examples', 'Present balanced view', 'Highlight key differences']
  },
  {
    id: 'academic-3',
    category: 'academic',
    difficulty: 'advanced',
    question: 'Present your research findings on the impact of social media on mental health.',
    context: 'You\'re at an academic conference.',
    timeLimit: 300,
    tips: ['Start with methodology', 'Present key findings', 'Discuss implications']
  },

  // Creative Category
  {
    id: 'creative-1',
    category: 'creative',
    difficulty: 'beginner',
    question: 'Describe a world where everyone can fly.',
    context: 'You\'re in a creative writing workshop.',
    timeLimit: 120,
    tips: ['Use vivid imagery', 'Consider practical implications', 'Make it engaging']
  },
  {
    id: 'creative-2',
    category: 'creative',
    difficulty: 'intermediate',
    question: 'Pitch a movie idea based on an unusual premise.',
    context: 'You\'re in a screenwriting class.',
    timeLimit: 180,
    tips: ['Hook the audience first', 'Describe the conflict', 'Mention target audience']
  },
  {
    id: 'creative-3',
    category: 'creative',
    difficulty: 'advanced',
    question: 'Present an innovative solution to a common urban problem.',
    context: 'You\'re at a design thinking conference.',
    timeLimit: 300,
    tips: ['Identify the root cause', 'Present unique approach', 'Address feasibility']
  },

  // Current Events Category
  {
    id: 'current-1',
    category: 'current-events',
    difficulty: 'beginner',
    question: 'Share your thoughts on remote work trends.',
    context: 'You\'re in a casual conversation with colleagues.',
    timeLimit: 120,
    tips: ['Mention both pros and cons', 'Share personal experience', 'Consider future implications']
  },
  {
    id: 'current-2',
    category: 'current-events',
    difficulty: 'intermediate',
    question: 'Discuss the impact of technology on education.',
    context: 'You\'re in a panel discussion.',
    timeLimit: 180,
    tips: ['Consider different perspectives', 'Use specific examples', 'Address challenges']
  },
  {
    id: 'current-3',
    category: 'current-events',
    difficulty: 'advanced',
    question: 'Present your analysis of the current state of renewable energy adoption.',
    context: 'You\'re at an environmental policy forum.',
    timeLimit: 300,
    tips: ['Present data-driven insights', 'Address barriers', 'Suggest solutions']
  }
];

export const getRandomQuestion = (category?: string, difficulty?: string): SpeakingQuestion => {
  let filtered = speakingQuestions;
  
  if (category) {
    filtered = filtered.filter(q => q.category === category);
  }
  
  if (difficulty) {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }
  
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
};

export const getQuestionsByCategory = (category: string): SpeakingQuestion[] => {
  return speakingQuestions.filter(q => q.category === category);
};

export const getQuestionsByDifficulty = (difficulty: string): SpeakingQuestion[] => {
  return speakingQuestions.filter(q => q.difficulty === difficulty);
};
