import React from 'react';

export const MotivationalBanner = ({ message }) => {
  return (
    <div className="motivational-banner" id="motivationalBanner">
      <span className="banner-icon" aria-hidden="true">💡</span>
      <p id="motivationalText">{message || 'Comece a registrar suas transações!'}</p>
    </div>
  );
};
