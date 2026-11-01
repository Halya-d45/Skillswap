import mongoose from 'mongoose';

/**
 * Skill Schema
 * Represents a skill offered or sought by a user on SkillSwap
 */
const skillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Skill must belong to a user'],
    },
    skillName: {
      type: String,
      required: [true, 'Please provide the skill name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: [
        'Programming',
        'Design',
        'Languages',
        'Marketing',
        'Music',
        'Business',
        'Other',
      ],
      default: 'Programming',
    },
    description: {
      type: String,
      required: [true, 'Please describe the skill'],
      trim: true,
    },
    skillType: {
      type: String,
      enum: ['teaching', 'learning'],
      default: 'teaching',
    },
    wantsToLearn: {
      type: String,
      default: 'Web Development',
      trim: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'Intermediate',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias: 'user' maps to 'userId'
skillSchema.virtual('user').get(function () {
  return this.userId;
});

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;
