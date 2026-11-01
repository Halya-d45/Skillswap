import { ArrowLeftRight, Star } from 'lucide-react';
import '../styles/SkillCard.css';

function SkillCard({ skill, onRequest, showRequestButton = true }) {
  const {
    userName,
    userRole,
    userAvatar,
    skillName,
    category,
    description,
    wantsToLearn,
    rating = 4.9,
    reviewsCount = 18,
  } = skill;

  return (
    <div className="skill-card">
      {/* Top Header with Author Info & Category */}
      <div className="skill-card-top">
        <div className="skill-card-author">
          <img
            src={userAvatar}
            alt={userName}
            className="author-avatar"
            onError={(e) => {
              // Fallback placeholder if image fails
              e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
            }}
          />
          <div className="author-details">
            <span className="author-name">{userName}</span>
            <span className="author-role">{userRole}</span>
          </div>
        </div>
        <span className="skill-category-badge">{category}</span>
      </div>

      {/* Main Body */}
      <div className="skill-card-body">
        <h3 className="skill-title">{skillName}</h3>
        <p className="skill-description">{description}</p>

        {/* Exchange Wanted Section */}
        <div className="exchange-info-box">
          <ArrowLeftRight size={16} className="exchange-icon" />
          <span className="exchange-label">Looking for:</span>
          <span className="exchange-value">{wantsToLearn}</span>
        </div>
      </div>

      {/* Rating & Action Button */}
      <div className="skill-card-footer">
        <div className="skill-rating">
          <Star size={16} className="star-icon" />
          <span>{rating}</span>
          <span className="review-count">({reviewsCount})</span>
        </div>

        {showRequestButton && (
          <button
            type="button"
            className="btn btn-primary btn-sm btn-request"
            onClick={() => onRequest && onRequest(skill)}
          >
            Request Exchange
          </button>
        )}
      </div>
    </div>
  );
}

export default SkillCard;
