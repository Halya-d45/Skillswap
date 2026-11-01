import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

import User from './models/User.js';
import Skill from './models/Skill.js';
import Request from './models/Request.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is not set in backend/.env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, { family: 4 });
    console.log('Connected! Checking existing data...');

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`Database already has ${userCount} users. Seeding additional demo users if not present.`);
    }

    const salt = await bcrypt.genSalt(10);
    const demoPassword = await bcrypt.hash('password123', salt);

    // 1. Create or ensure demo users exist
    const demoUsersData = [
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        password: demoPassword,
        bio: 'Senior UI/UX Product Designer loving wireframing, design systems, and Figma component architecture.',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        location: 'San Francisco, CA',
        skillsToTeach: ['UI/UX Design & Figma', 'Design Systems', 'Wireframing'],
        skillsToLearn: ['Python Programming', 'React.js'],
      },
      {
        name: 'David Miller',
        email: 'david.miller@example.com',
        password: demoPassword,
        bio: 'Data Scientist passionate about Pandas, exploratory data analysis, and predictive machine learning models.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        location: 'Austin, TX',
        skillsToTeach: ['Data Analysis with Pandas', 'Machine Learning Basics', 'SQL Databases'],
        skillsToLearn: ['React & Modern JavaScript', 'UI/UX Design'],
      },
      {
        name: 'Elena Rodriguez',
        email: 'elena.rodriguez@example.com',
        password: demoPassword,
        bio: 'Frontend Developer building responsive React SPAs, hooks, state patterns, and modern JavaScript web apps.',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        location: 'Seattle, WA',
        skillsToTeach: ['React & Modern JavaScript', 'CSS3 & Responsive Layouts', 'HTML5 Accessibility'],
        skillsToLearn: ['UI/UX Design & Figma', 'Python Programming'],
      },
      {
        name: 'Marcus Johnson',
        email: 'marcus.johnson@example.com',
        password: demoPassword,
        bio: 'Digital marketing strategist focusing on organic growth, keyword research, SEO best practices, and copywriting.',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        location: 'Chicago, IL',
        skillsToTeach: ['SEO & Organic Growth', 'Content Strategy', 'Copywriting'],
        skillsToLearn: ['Git & GitHub', 'Web Development'],
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        password: demoPassword,
        bio: 'Language instructor and polyglot offering conversational Spanish for all levels from beginner to advanced.',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        location: 'Boston, MA',
        skillsToTeach: ['Conversational Spanish', 'Spanish Grammar', 'Language Immersion'],
        skillsToLearn: ['React.js', 'Web Design'],
      },
    ];

    const seededUsers = [];
    for (const u of demoUsersData) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create(u);
        console.log(`Created user: ${existing.name} (${existing.email})`);
      }
      seededUsers.push(existing);
    }

    // 2. Create skills linked to these users
    const demoSkillsData = [
      {
        userIndex: 0,
        skillName: 'UI/UX Design & Figma',
        category: 'Design',
        description: 'Learn modern UI wireframing, interactive Figma component systems, and intuitive user experience design principles.',
        skillType: 'teaching',
        wantsToLearn: 'Python Programming',
        level: 'Advanced',
      },
      {
        userIndex: 1,
        skillName: 'Data Analysis with Pandas',
        category: 'Programming',
        description: 'Master data cleaning, exploratory data analysis, and creating visual charts using Python, Pandas, and Matplotlib.',
        skillType: 'teaching',
        wantsToLearn: 'SQL Databases',
        level: 'Intermediate',
      },
      {
        userIndex: 2,
        skillName: 'React & Modern JavaScript',
        category: 'Programming',
        description: 'Build responsive single-page web apps with React hooks, state management, and modern ES6+ JavaScript concepts.',
        skillType: 'teaching',
        wantsToLearn: 'UI/UX Design & Figma',
        level: 'Intermediate',
      },
      {
        userIndex: 3,
        skillName: 'SEO & Organic Growth',
        category: 'Marketing',
        description: 'Understand technical SEO, keyword research strategies, and content optimization to drive organic web traffic.',
        skillType: 'teaching',
        wantsToLearn: 'Git & GitHub',
        level: 'All Levels',
      },
      {
        userIndex: 4,
        skillName: 'Conversational Spanish',
        category: 'Languages',
        description: 'Interactive conversational Spanish practice, essential grammar rules, and cultural fluency for travel or work.',
        skillType: 'teaching',
        wantsToLearn: 'React.js',
        level: 'All Levels',
      },
    ];

    for (const s of demoSkillsData) {
      const owner = seededUsers[s.userIndex];
      const existing = await Skill.findOne({ userId: owner._id, skillName: s.skillName });
      if (!existing) {
        await Skill.create({
          userId: owner._id,
          skillName: s.skillName,
          category: s.category,
          description: s.description,
          skillType: s.skillType,
          wantsToLearn: s.wantsToLearn,
          level: s.level,
        });
        console.log(`Created skill: "${s.skillName}" by ${owner.name}`);
      }
    }

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
};

seedData();
