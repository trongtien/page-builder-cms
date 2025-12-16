import React from 'react';

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'medium', className = '' }) => {
  const classes = ['spinner', `spinner-${size}`, className].filter(Boolean).join(' ');

  return <div className={classes} role="status" aria-label="Loading" />;
};

export interface LoadingProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ text, size = 'medium', fullScreen = false }) => {
  const containerClass = fullScreen ? 'loading loading-fullscreen' : 'loading';

  return (
    <div className={containerClass}>
      <Spinner size={size} />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};
