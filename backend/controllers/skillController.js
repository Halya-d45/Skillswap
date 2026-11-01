import mongoose from 'mongoose';
import Skill from '../models/Skill.js';
import User from '../models/User.js';

/**
 * @desc    Get all available skills with optional search & category filter
 * @route   GET /api/skills
 * @access  Public
 */
export const getAllSkills = async (req, res) => {
  try {
    const { search, category, type } = req.query;
    const query = {};

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by skillType ('teaching' or 'learning')
    if (type) {
      query.skillType = type;
    }

    // Search query in skillName, description, or wantsToLearn
    if (search) {
      query.$or = [
        { skillName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { wantsToLearn: { $regex: search, $options: 'i' } },
      ];
    }

    const skills = await Skill.find(query)
      .populate('userId', 'name email profileImage avatar bio location')
      .sort({ createdAt: -1 });

    return res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error.message);
    return res.status(500).json({ message: 'Server error fetching skills', error: error.message });
  }
};

/**
 * @desc    Search skills specifically by name / keyword
 * @route   GET /api/skills/search
 * @access  Public
 */
export const searchSkills = async (req, res) => {
  try {
    const keyword = req.query.q || req.query.name || req.query.search || '';

    const query = keyword
      ? {
          $or: [
            { skillName: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
            { category: { $regex: keyword, $options: 'i' } },
          ],
        }
      : {};

    const skills = await Skill.find(query)
      .populate('userId', 'name email profileImage avatar bio location')
      .sort({ createdAt: -1 });

    return res.json(skills);
  } catch (error) {
    console.error('Error searching skills:', error.message);
    return res.status(500).json({ message: 'Server error searching skills', error: error.message });
  }
};

/**
 * @desc    Get single skill by ID
 * @route   GET /api/skills/:id
 * @access  Public
 */
export const getSkillById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Skill ID format' });
    }

    const skill = await Skill.findById(req.params.id).populate(
      'userId',
      'name email profileImage avatar bio location'
    );

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    return res.json(skill);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching skill', error: error.message });
  }
};

/**
 * @desc    Create a new skill
 * @route   POST /api/skills
 * @access  Private
 */
export const createSkill = async (req, res) => {
  try {
    const { skillName, category, description, skillType, wantsToLearn, level } = req.body;

    if (!skillName || !description) {
      return res.status(400).json({
        message: 'Please provide skill name and description',
      });
    }

    const skill = await Skill.create({
      userId: req.user._id,
      skillName: skillName.trim(),
      category: category || 'Programming',
      description: description.trim(),
      skillType: skillType || 'teaching',
      wantsToLearn: wantsToLearn ? wantsToLearn.trim() : 'Web Development',
      level: level || 'Intermediate',
    });

    // Also append to user's skillsToTeach / skillsToLearn in profile
    const updateField =
      skill.skillType === 'learning' ? 'skillsToLearn' : 'skillsToTeach';

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { [updateField]: skill.skillName },
    });

    const populatedSkill = await Skill.findById(skill._id).populate(
      'userId',
      'name email profileImage avatar bio location'
    );

    return res.status(201).json(populatedSkill);
  } catch (error) {
    console.error('Error creating skill:', error.message);
    return res.status(500).json({ message: 'Server error creating skill', error: error.message });
  }
};

/**
 * @desc    Update a skill
 * @route   PUT /api/skills/:id
 * @access  Private
 */
export const updateSkill = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Skill ID format' });
    }

    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Only owner can update their skill
    if (skill.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this skill' });
    }

    skill.skillName = req.body.skillName !== undefined ? req.body.skillName.trim() : skill.skillName;
    skill.category = req.body.category || skill.category;
    skill.description = req.body.description !== undefined ? req.body.description.trim() : skill.description;
    skill.skillType = req.body.skillType || skill.skillType;
    skill.wantsToLearn = req.body.wantsToLearn !== undefined ? req.body.wantsToLearn.trim() : skill.wantsToLearn;
    skill.level = req.body.level || skill.level;

    const updated = await skill.save();
    return res.json(updated);
  } catch (error) {
    console.error('Error updating skill:', error.message);
    return res.status(500).json({ message: 'Server error updating skill', error: error.message });
  }
};

/**
 * @desc    Delete a skill
 * @route   DELETE /api/skills/:id
 * @access  Private
 */
export const deleteSkill = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Skill ID format' });
    }

    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Only owner can delete their skill
    if (skill.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this skill' });
    }

    await skill.deleteOne();
    return res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error.message);
    return res.status(500).json({ message: 'Server error deleting skill', error: error.message });
  }
};

/**
 * @desc    Get skills created by the logged-in user
 * @route   GET /api/skills/user
 * @access  Private
 */
export const getUserSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(skills);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching user skills', error: error.message });
  }
};
