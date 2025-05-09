import React, { useState, useEffect } from 'react';

interface DialogueBoxProps {
  text: string;
  speaker: string;
  onAdvance: () => void;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({ text, speaker, onAdvance }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const typingSpeed = 30; // ms per character

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, typingSpeed);
    
    return () => clearInterval(timer);
  }, [text]);

  const handleClick = () => {
    if (isTyping) {
      // Show all text immediately if still typing
      setDisplayedText(text);
      setIsTyping(false);
    } else {
      // Advance to next dialogue
      onAdvance();
    }
  };

  return (
    <div 
      className="dialogue-box mx-4 md:mx-auto" 
      onClick={handleClick}
    >
      {speaker && (
        <div className="text-[#00ffff] mb-2 font-bold">
          {speaker}
        </div>
      )}
      <div>{displayedText}</div>
      {!isTyping && (
        <div className="text-right mt-2">
          <span className="text-[#ffff00] blink">▼</span>
        </div>
      )}
    </div>
  );
};

export default DialogueBox;