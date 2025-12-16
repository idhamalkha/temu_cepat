import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/entrance-animation.css';

export default function EntranceAnimation() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const shown = sessionStorage.getItem('entrance_animation_shown');
    
    if (shown) {
      setIsVisible(false);
    } else {
      // Total: text animations ~4.8s + closing animation 1.4s = ~6.2s
      const timer = setTimeout(() => {
        sessionStorage.setItem('entrance_animation_shown', 'true');
        setIsVisible(false);
      }, 6200);

      return () => clearTimeout(timer);
    }
  }, []);

  // Text fade-in with proper stagger (NOT instant)
  const textVariants = {
    hidden: { opacity: 0 },
    visible: (i) => ({
      opacity: 1,
      transition: {
        delay: 0.8 + (i * 1.2), // Proper stagger: line1=0.8s, line2=2s, author=3.2s
        duration: 1,
        ease: 'easeOut',
      },
    }),
  };

  // Simplified overlay animation (less properties = smoother, no lag)
  const overlayVariants = {
    initial: {
      y: 0,
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    },
    closing: {
      y: -1400,
      clipPath: [
        'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        'polygon(0 0, 100% 0, 100% 85%, 90% 92%, 75% 97%, 50% 100%, 25% 97%, 10% 92%, 0 85%)',
        'polygon(0 0, 100% 0, 100% 5%, 90% 2%, 75% 0%, 50% -2%, 25% 0%, 10% 2%, 0 5%)',
      ],
      transition: {
        delay: 4.8, // wait for author to finish (0.8 + 1 + 1.2 + 1 + 1 = 4.8s)
        duration: 1.4,
        times: [0, 0.3, 1],
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  // Simple content fade out
  const contentVariants = {
    initial: { opacity: 1 },
    closing: {
      opacity: 0,
      transition: {
        delay: 5.2, // fade out after closing animation starts
        duration: 0.5,
      },
    },
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="entrance-overlay"
        initial="initial"
        animate="closing"
        variants={overlayVariants}
      >
        <div className="entrance-bubble-container">
          <div className="entrance-bubble">
            <motion.div
              className="entrance-content"
              initial="initial"
              animate="closing"
              variants={contentVariants}
            >
              <motion.p
                className="entrance-quote-line entrance-line-1"
                custom={0}
                variants={textVariants}
                initial="hidden"
                animate="visible"
              >
                "Jujur mungkin tidak memberi Anda banyak teman,
              </motion.p>
              <motion.p
                className="entrance-quote-line entrance-line-2"
                custom={1}
                variants={textVariants}
                initial="hidden"
                animate="visible"
              >
                tetapi akan selalu memberi Anda teman yang tepat."
              </motion.p>
              <motion.p
                className="entrance-author"
                custom={2}
                variants={textVariants}
                initial="hidden"
                animate="visible"
              >
                – John Lennon
              </motion.p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

