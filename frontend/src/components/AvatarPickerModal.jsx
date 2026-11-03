import { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  Check,
  Sparkles,
  User,
  Image as ImageIcon,
  AlertCircle,
  Camera,
} from 'lucide-react';
import {
  ICON_AVATARS,
  ILLUSTRATED_AVATARS,
  CURATED_PHOTOS,
  processUserImageFile,
} from '../data/avatarPresets';
import '../styles/AvatarPickerModal.css';

function AvatarPickerModal({
  isOpen,
  onClose,
  currentAvatar,
  onSaveAvatar,
  userName = 'Member',
}) {
  const [activeTab, setActiveTab] = useState('icons');
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSelectPreset = (url) => {
    setSelectedAvatar(url);
    setUploadError('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadError('');

    try {
      const dataUrl = await processUserImageFile(file);
      setSelectedAvatar(dataUrl);
    } catch (err) {
      console.error('File process error:', err);
      setUploadError(err.message || 'Failed to process selected image');
    } finally {
      setIsProcessing(false);
      // Reset input so same file can be re-selected if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyUrl = (e) => {
    e.preventDefault();
    if (!customUrlInput.trim()) {
      setUploadError('Please enter a valid image URL');
      return;
    }
    setSelectedAvatar(customUrlInput.trim());
    setUploadError('');
  };

  const handleSave = async () => {
    if (!selectedAvatar) {
      setUploadError('Please select or upload an avatar first');
      return;
    }

    setIsSaving(true);
    setUploadError('');

    try {
      await onSaveAvatar(selectedAvatar);
      onClose();
    } catch (err) {
      console.error('Save avatar error:', err);
      setUploadError(err.message || 'Failed to save avatar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="avatar-modal-overlay" onClick={onClose}>
      <div
        className="avatar-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="avatar-modal-header">
          <div>
            <h3 className="avatar-modal-title">Choose Your Profile Picture</h3>
            <p className="avatar-modal-subtitle">
              Personalize your identity with an icon, illustrated character, or your own photo
            </p>
          </div>
          <button
            type="button"
            className="avatar-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Preview Section */}
        <div className="avatar-live-preview-box">
          <div className="avatar-preview-ring">
            <img
              src={selectedAvatar || currentAvatar}
              alt={userName}
              className="avatar-preview-img"
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
              }}
            />
          </div>
          <div className="avatar-preview-info">
            <div className="avatar-preview-name">{userName}</div>
            <div className="avatar-preview-status">
              Live Preview: Your profile picture across SkillSwap
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="avatar-tabs-nav">
          <button
            type="button"
            className={`avatar-tab-btn ${activeTab === 'icons' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('icons');
              setUploadError('');
            }}
          >
            <Sparkles size={16} /> Icon Badges
          </button>
          <button
            type="button"
            className={`avatar-tab-btn ${activeTab === 'illustrated' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('illustrated');
              setUploadError('');
            }}
          >
            <User size={16} /> Characters
          </button>
          <button
            type="button"
            className={`avatar-tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('photos');
              setUploadError('');
            }}
          >
            <ImageIcon size={16} /> Photos
          </button>
          <button
            type="button"
            className={`avatar-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('upload');
              setUploadError('');
            }}
          >
            <Upload size={16} /> Upload Photo
          </button>
          <button
            type="button"
            className={`avatar-tab-btn ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('url');
              setUploadError('');
            }}
          >
            <LinkIcon size={16} /> Image URL
          </button>
        </div>

        {/* Error notification if any */}
        {uploadError && (
          <div className="avatar-error-banner">
            <AlertCircle size={16} />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="avatar-tab-body">
          {/* TAB 1: Icon Badges */}
          {activeTab === 'icons' && (
            <div className="avatar-grid">
              {ICON_AVATARS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`avatar-grid-item ${
                    selectedAvatar === item.url ? 'is-selected' : ''
                  }`}
                  onClick={() => handleSelectPreset(item.url)}
                  title={item.label}
                >
                  <img src={item.url} alt={item.label} className="avatar-thumb" />
                  <span className="avatar-thumb-label">{item.label}</span>
                  {selectedAvatar === item.url && (
                    <div className="avatar-check-badge">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* TAB 2: Illustrated Characters */}
          {activeTab === 'illustrated' && (
            <div className="avatar-grid">
              {ILLUSTRATED_AVATARS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`avatar-grid-item ${
                    selectedAvatar === item.url ? 'is-selected' : ''
                  }`}
                  onClick={() => handleSelectPreset(item.url)}
                  title={item.label}
                >
                  <img src={item.url} alt={item.label} className="avatar-thumb" />
                  <span className="avatar-thumb-label">{item.label}</span>
                  {selectedAvatar === item.url && (
                    <div className="avatar-check-badge">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* TAB 3: Curated Photos */}
          {activeTab === 'photos' && (
            <div className="avatar-grid">
              {CURATED_PHOTOS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`avatar-grid-item ${
                    selectedAvatar === item.url ? 'is-selected' : ''
                  }`}
                  onClick={() => handleSelectPreset(item.url)}
                  title={item.label}
                >
                  <img src={item.url} alt={item.label} className="avatar-thumb" />
                  <span className="avatar-thumb-label">{item.label}</span>
                  {selectedAvatar === item.url && (
                    <div className="avatar-check-badge">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* TAB 4: Upload Custom Image */}
          {activeTab === 'upload' && (
            <div className="avatar-upload-panel">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
                onChange={handleFileChange}
              />
              <div
                className="avatar-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="avatar-dropzone-icon">
                  <Camera size={36} />
                </div>
                <h4>Choose an image from your device</h4>
                <p>Supports PNG, JPG, JPEG, WEBP or GIF (automatically centered & optimized)</p>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={isProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  {isProcessing ? 'Processing Image...' : 'Browse Computer / Phone'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Image URL */}
          {activeTab === 'url' && (
            <form className="avatar-url-panel" onSubmit={handleApplyUrl}>
              <label htmlFor="custom-avatar-url" className="form-label">
                Image Web Address (URL)
              </label>
              <div className="avatar-url-input-group">
                <input
                  type="url"
                  id="custom-avatar-url"
                  className="form-input"
                  placeholder="https://example.com/my-photo.jpg"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                />
                <button type="submit" className="btn btn-outline">
                  Preview URL
                </button>
              </div>
              <span className="form-input-help">
                You can paste an avatar link from GitHub, Google, Unsplash, or any public image URL.
              </span>
            </form>
          )}
        </div>

        {/* Modal Actions */}
        <div className="avatar-modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSaving || !selectedAvatar}
          >
            <Check size={16} /> {isSaving ? 'Saving Avatar...' : 'Save Profile Picture'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AvatarPickerModal;
