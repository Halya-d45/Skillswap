import express from 'express';
import {
  getAllSkills,
  searchSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getUserSkills,
} from '../controllers/skillController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Specific routes first before dynamic :id routes
router.get('/search', searchSkills);
router.get('/user', protect, getUserSkills);

// Collection routes
router.get('/', getAllSkills);
router.post('/', protect, createSkill);

// Item routes by ID
router.get('/:id', getSkillById);
router.put('/:id', protect, updateSkill);
router.delete('/:id', protect, deleteSkill);

export default router;
