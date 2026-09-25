import React from 'react';

interface AvatarProps {
  name?: string;
  url?: string;
  className?: string;
}

// Shows a person's photo, or their initial when they haven't added one,
// instead of a broken image.
export const Avatar: React.FC<AvatarProps> = ({ name, url, className = 'w-14 h-14' }) => {
  if (url) {
    return <img src={url} alt={name || 'Profile photo'} className={`${className} rounded-full object-cover border border-[#E3E2DE] shrink-0`} />;
  }
  return (
    <div
      aria-label={name || 'Profile photo'}
      className={`${className} rounded-full bg-[#123B5D] text-white flex items-center justify-center font-semibold shrink-0`}
    >
      {(name?.trim()[0] || 'S').toUpperCase()}
    </div>
  );
};
