import React from 'react';

interface StoreLogoProps {
  className?: string;
  bgColor?: string;
  showBackground?: boolean;
}

export const StoreLogo: React.FC<StoreLogoProps> = ({
  className = "w-full h-full object-contain",
  bgColor = "#FFFFFF",
  showBackground = true
}) => {
  return (
    <img 
      src="/logo.png" 
      alt="RycreoShop Official Logo" 
      className={`${className} ${showBackground ? 'rounded-full' : ''}`}
      style={{ backgroundColor: showBackground ? bgColor : 'transparent' }}
    />
  );
};

