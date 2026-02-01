
import React from 'react';

interface IconProps {
  name: 'plus' | 'trash' | 'check' | 'sparkles' | 'chevron-down' | 'chevron-right' | 'more' | 'clock' | 'brain' | 'search';
  className?: string;
  onClick?: () => void;
}

export const Icon: React.FC<IconProps> = ({ name, className = '', onClick }) => {
  const paths: Record<string, React.ReactNode> = {
    plus: <path d="M12 5v14M5 12h14" />,
    trash: <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <path d="M20 6L9 17l-5-5" />,
    sparkles: <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />,
    'chevron-down': <path d="M6 9l6 6 6-6" />,
    'chevron-right': <path d="M9 18l6-6-6-6" />,
    more: <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />,
    clock: <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />,
    brain: <path d="M9.5 2A5 5 0 0 1 12 8a5 5 0 0 1 2.5-6 4.5 4.5 0 1 1 0 9 4.5 4.5 0 1 1-5 0 4.5 4.5 0 1 1 0-9z" />,
    search: <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />,
  };

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`inline-block ${className}`}
      onClick={onClick}
    >
      {paths[name]}
    </svg>
  );
};
