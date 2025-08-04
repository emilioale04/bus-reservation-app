import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    setShowTimeout(timeout);
  };

  const hideTooltip = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      setShowTimeout(null);
    }
    
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 100);
    
    setHideTimeout(timeout);
  };

  const handleMouseEnter = () => {
    showTooltip();
  };

  const handleMouseLeave = () => {
    hideTooltip();
  };

  const handleFocus = () => {
    showTooltip();
  };

  const handleBlur = () => {
    hideTooltip();
  };

  useEffect(() => {
    return () => {
      if (showTimeout) clearTimeout(showTimeout);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [showTimeout, hideTimeout]);

  const getTooltipClasses = () => {
    const baseClasses = `
      absolute z-50 px-4 py-3 text-sm font-medium text-white bg-gray-900 
      rounded-lg shadow-lg transition-opacity duration-200 w-64 text-center leading-relaxed
      ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}
    `;

    const positionClasses = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-3',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-3',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-3',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-3'
    };

    return `${baseClasses} ${positionClasses[position]}`;
  };

  const getArrowClasses = () => {
    const arrowClasses = {
      top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900 border-l-8 border-r-8 border-t-8',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900 border-l-8 border-r-8 border-b-8',
      left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900 border-t-8 border-b-8 border-l-8',
      right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900 border-t-8 border-b-8 border-r-8'
    };

    return `absolute w-0 h-0 ${arrowClasses[position]}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {React.cloneElement(children)}
      
      <div
        ref={tooltipRef}
        className={getTooltipClasses()}
        role="tooltip"
        aria-hidden={!isVisible}
      >
        {content}
        <div className={getArrowClasses()} />
      </div>
    </div>
  );
};

export default Tooltip;
