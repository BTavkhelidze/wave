import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  backgroundColor?: string;
  mainBackgroundColor?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  backgroundColor = '#455ce9',
  mainBackgroundColor = 'transparent',
  ...attributes
}) => {
  const circle = useRef<HTMLDivElement | null>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!circle.current) return;

    timeline.current = gsap.timeline({ paused: true });

    timeline.current
      .to(
        circle.current,
        { top: '-25%', width: '150%', duration: 0.4, ease: 'power3.in' },
        'enter'
      )
      .to(
        circle.current,
        { top: '-150%', width: '125%', duration: 0.25 },
        'exit'
      );
  }, []);

  const manageMouseEnter = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
    if (timeline.current) {
      timeline.current.tweenFromTo('enter', 'exit');
    }
  };

  const manageMouseLeave = () => {
    timeoutId.current = setTimeout(() => {
      if (timeline.current) {
        timeline.current.play();
      }
    }, 300);
  };

  return (
    <div
      onMouseEnter={manageMouseEnter}
      onMouseLeave={manageMouseLeave}
      className='border relative rounded-4xl font-medium border-gray-400 self-center  cursor-pointer flex items-center justify-center px-[60px] py-[20px] overflow-hidden'
      {...attributes}
      style={{ backgroundColor: mainBackgroundColor }}
    >
      {children}
      <div
        ref={circle}
        style={{ backgroundColor }}
        className='w-full top-[100%] rounded-[50%] absolute h-[150%] bg-amber-400 dark:bg-amber-800'
      />
    </div>
  );
};

export default Button;
