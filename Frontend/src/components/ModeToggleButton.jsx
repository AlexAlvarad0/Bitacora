import React from 'react';
import ThemeToggle from './ThemeToggle';

const ModeToggleButton = () => {
  return (
    <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1100 }}>
      <ThemeToggle />
    </div>
  );
};

export default ModeToggleButton;
