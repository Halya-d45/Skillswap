/**
 * Helper to generate offline-safe SVG avatars with vibrant gradients and icons/emojis
 */
export const createEmojiAvatar = (emoji, gradStart, gradEnd) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${gradStart}"/><stop offset="100%" stop-color="${gradEnd}"/></linearGradient></defs><rect width="120" height="120" rx="60" fill="url(#g)"/><text x="50%" y="54%" font-size="52" text-anchor="middle" dominant-baseline="middle">${emoji}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Curated list of Icon & Emoji Avatars (Self-contained SVG data URIs)
 */
export const ICON_AVATARS = [
  { id: 'icon-dev', label: 'Coder', url: createEmojiAvatar('💻', '#3b82f6', '#1d4ed8') },
  { id: 'icon-art', label: 'Designer', url: createEmojiAvatar('🎨', '#ec4899', '#8b5cf6') },
  { id: 'icon-rocket', label: 'Innovator', url: createEmojiAvatar('🚀', '#f97316', '#ef4444') },
  { id: 'icon-zap', label: 'Energetic', url: createEmojiAvatar('⚡', '#f59e0b', '#d97706') },
  { id: 'icon-brain', label: 'Thinker', url: createEmojiAvatar('🧠', '#10b981', '#059669') },
  { id: 'icon-music', label: 'Musician', url: createEmojiAvatar('🎵', '#8b5cf6', '#6366f1') },
  { id: 'icon-coffee', label: 'Creator', url: createEmojiAvatar('☕', '#b45309', '#78350f') },
  { id: 'icon-globe', label: 'Explorer', url: createEmojiAvatar('🌐', '#06b6d4', '#0284c7') },
  { id: 'icon-book', label: 'Scholar', url: createEmojiAvatar('📚', '#6366f1', '#4338ca') },
  { id: 'icon-camera', label: 'Visualist', url: createEmojiAvatar('📷', '#14b8a6', '#0f766e') },
  { id: 'icon-target', label: 'Strategist', url: createEmojiAvatar('🎯', '#f43f5e', '#be123c') },
  { id: 'icon-sparkles', label: 'Star', url: createEmojiAvatar('✨', '#eab308', '#ca8a04') },
  { id: 'icon-fire', label: 'Trailblazer', url: createEmojiAvatar('🔥', '#ea580c', '#c2410c') },
  { id: 'icon-game', label: 'Gamer', url: createEmojiAvatar('🎮', '#a855f7', '#7e22ce') },
  { id: 'icon-robot', label: 'Techie', url: createEmojiAvatar('🤖', '#64748b', '#334155') },
  { id: 'icon-shield', label: 'Mentor', url: createEmojiAvatar('🛡️', '#0284c7', '#0369a1') },
];

/**
 * Illustrated vector avatars (DiceBear collections)
 */
export const ILLUSTRATED_AVATARS = [
  { id: 'ill-felix', label: 'Felix', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  { id: 'ill-aneka', label: 'Aneka', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
  { id: 'ill-zack', label: 'Zack', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack' },
  { id: 'ill-molly', label: 'Molly', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Molly' },
  { id: 'ill-jasper', label: 'Jasper', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper' },
  { id: 'ill-sara', label: 'Sara', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara' },
  { id: 'ill-alex', label: 'Alex', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Alex' },
  { id: 'ill-taylor', label: 'Taylor', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Taylor' },
  { id: 'ill-elena', label: 'Elena', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Elena' },
  { id: 'ill-liam', label: 'Liam', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Liam' },
  { id: 'ill-bot1', label: 'Bot Gizmo', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo' },
  { id: 'ill-bot2', label: 'Bot Sparky', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky' },
];

/**
 * Curated real photo presets
 */
export const CURATED_PHOTOS = [
  {
    id: 'photo-1',
    label: 'Portrait 1',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'photo-2',
    label: 'Portrait 2',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'photo-3',
    label: 'Portrait 3',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'photo-4',
    label: 'Portrait 4',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'photo-5',
    label: 'Portrait 5',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'photo-6',
    label: 'Portrait 6',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'photo-7',
    label: 'Portrait 7',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'photo-8',
    label: 'Portrait 8',
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=250',
  },
];

/**
 * Resizes and center-crops a user-selected image file to square 300x300 JPEG data URL
 */
export const processUserImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file selected'));
    }
    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (PNG, JPG, WEBP, GIF, etc.).'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height);
          const targetSize = Math.min(320, size);
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          // Center crop
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;
          ctx.drawImage(img, startX, startY, size, size, 0, 0, targetSize, targetSize);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(dataUrl);
        } catch (err) {
          reject(new Error('Failed to process image canvas: ' + err.message));
        }
      };
      img.onerror = () => reject(new Error('Could not decode the selected image file.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
};
