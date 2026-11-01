// Initial mock data and local storage helpers for SkillSwap

export const initialCurrentUser = {
  id: 'user_1',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  role: 'Full-Stack Learner & Python Mentor',
  bio: 'Passionate developer loving to share Python backend knowledge while picking up modern Web Design and React skills.',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  skillsTeach: ['Python Programming', 'Django Framework', 'SQL & Databases', 'Git & GitHub'],
  skillsLearn: ['UI/UX Design', 'React.js', 'Figma Prototyping', 'Mobile App Development'],
  memberSince: 'March 2024',
  location: 'San Francisco, CA',
  rating: 4.9,
  swapsCompleted: 8,
};

export const initialSkillsList = [
  {
    id: 1,
    userName: 'Sarah Chen',
    userRole: 'Senior Product Designer',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    skillName: 'UI/UX Design & Figma',
    category: 'Design',
    level: 'Advanced',
    description: 'Learn modern UI wireframing, interactive Figma component systems, and intuitive user experience design principles.',
    wantsToLearn: 'Python Programming',
    rating: 4.9,
    reviewsCount: 24,
  },
  {
    id: 2,
    userName: 'David Miller',
    userRole: 'Data Scientist & AI Enthusiast',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    skillName: 'Data Analysis with Pandas',
    category: 'Programming',
    level: 'Intermediate',
    description: 'Master data cleaning, exploratory data analysis, and creating visual charts using Python, Pandas, and Matplotlib.',
    wantsToLearn: 'SQL & Databases',
    rating: 4.8,
    reviewsCount: 19,
  },
  {
    id: 3,
    userName: 'Elena Rodriguez',
    userRole: 'Frontend Developer',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    skillName: 'React & Modern JavaScript',
    category: 'Programming',
    level: 'Intermediate',
    description: 'Build responsive single-page web apps with React hooks, state management, and modern ES6+ JavaScript concepts.',
    wantsToLearn: 'UI/UX Design',
    rating: 5.0,
    reviewsCount: 31,
  },
  {
    id: 4,
    userName: 'Marcus Johnson',
    userRole: 'Digital Marketing Specialist',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    skillName: 'SEO & Organic Growth',
    category: 'Marketing',
    level: 'Expert',
    description: 'Understand technical SEO, keyword research strategies, and content optimization to drive organic web traffic.',
    wantsToLearn: 'Git & GitHub',
    rating: 4.7,
    reviewsCount: 15,
  },
  {
    id: 5,
    userName: 'Priya Sharma',
    userRole: 'Bilingual Translator & Tutor',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    skillName: 'Spanish for Beginners & Fluency',
    category: 'Languages',
    level: 'All Levels',
    description: 'Interactive conversational Spanish practice, essential grammar rules, and cultural fluency for travel or work.',
    wantsToLearn: 'React.js',
    rating: 4.9,
    reviewsCount: 42,
  },
  {
    id: 6,
    userName: 'Lucas Silva',
    userRole: 'Music Producer & Audio Engineer',
    userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    skillName: 'Music Production in Ableton',
    category: 'Music',
    level: 'Beginner to Intermediate',
    description: 'Learn beat making, audio synthesis, mixing basics, and song arrangement using industry-standard digital tools.',
    wantsToLearn: 'Video Editing',
    rating: 4.8,
    reviewsCount: 17,
  },
  {
    id: 7,
    userName: 'Amina Yusuf',
    userRole: 'Startup Coach & Founder',
    userAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200',
    skillName: 'Public Speaking & Pitching',
    category: 'Business',
    level: 'Intermediate',
    description: 'Overcome presentation anxiety, structure compelling pitch decks, and deliver presentations with poise and confidence.',
    wantsToLearn: 'Django Framework',
    rating: 4.9,
    reviewsCount: 28,
  },
  {
    id: 8,
    userName: 'James Wilson',
    userRole: 'Mobile App Developer',
    userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    skillName: 'Flutter Mobile App Development',
    category: 'Programming',
    level: 'Intermediate',
    description: 'Create cross-platform Android and iOS mobile applications from a single Dart codebase with clean state management.',
    wantsToLearn: 'Figma Prototyping',
    rating: 4.6,
    reviewsCount: 12,
  },
];

export const initialRequests = {
  received: [
    {
      id: 'req_rec_1',
      senderName: 'Sarah Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      skillOffered: 'UI/UX Design & Figma',
      skillRequested: 'Python Programming',
      date: '2 hours ago',
      status: 'Pending',
      message: 'Hi Alex! I saw your Python mentoring offer. I can help you with interactive UI/UX design in exchange!',
    },
    {
      id: 'req_rec_2',
      senderName: 'David Miller',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      skillOffered: 'Data Analysis with Pandas',
      skillRequested: 'SQL & Databases',
      date: 'Yesterday',
      status: 'Accepted',
      message: 'Hey Alex, excited to exchange SQL database optimization tips for Python data cleaning walkthroughs.',
    },
  ],
  sent: [
    {
      id: 'req_sent_1',
      recipientName: 'Elena Rodriguez',
      recipientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      skillOffered: 'Python Programming',
      skillRequested: 'React & Modern JavaScript',
      date: '3 days ago',
      status: 'Pending',
      message: 'Hi Elena! I would love to learn React component design and modern hooks in exchange for Python backend lessons.',
    },
    {
      id: 'req_sent_2',
      recipientName: 'Marcus Johnson',
      recipientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      skillOffered: 'Git & GitHub',
      skillRequested: 'SEO & Organic Growth',
      date: '1 week ago',
      status: 'Accepted',
      message: 'Hello Marcus, lets connect to swap Git version control best practices for SEO content strategies.',
    },
  ],
};

// Local storage helper functions to keep sample state active
export const getStoredUser = () => {
  const saved = localStorage.getItem('skillswap_user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing stored user', e);
    }
  }
  return initialCurrentUser;
};

export const saveStoredUser = (user) => {
  localStorage.setItem('skillswap_user', JSON.stringify(user));
};

export const getStoredRequests = () => {
  const saved = localStorage.getItem('skillswap_requests');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing stored requests', e);
    }
  }
  return initialRequests;
};

export const saveStoredRequests = (requests) => {
  localStorage.setItem('skillswap_requests', JSON.stringify(requests));
};
