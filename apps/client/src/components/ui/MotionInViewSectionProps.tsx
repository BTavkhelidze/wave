'use client';

import { motion, useInView } from 'motion/react';
import { ReactNode, useRef } from 'react';

interface MotionInViewSectionProps {
  children: ReactNode;
  delay?: number;
}

const MotionInViewSection: React.FC<MotionInViewSectionProps> = ({
  children,
  delay = 0,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
};

export default MotionInViewSection;
