import React from 'react';

interface ListenerAvatarProps {
  name?: string;
  url?: string;
  className?: string;
}

// Shows the listener's photo, or their initial when they haven't added one,
// instead of a broken image.
export const ListenerAvatar: React.FC<ListenerAvatarProps> = ({ name, url, className = 'w-14 h-14' }) => {
  if (url) {
    return <img src={url} alt={name || 'Listener'} className={`${className} rounded-full object-cover border border-[#E3E2DE] shrink-0`} />;
  }
  return (
    <div
      aria-label={name || 'Listener'}
      className={`${className} rounded-full bg-[#123B5D] text-white flex items-center justify-center font-semibold shrink-0`}
    >
      {(name?.trim()[0] || 'L').toUpperCase()}
    </div>
  );
};
