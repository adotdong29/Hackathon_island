import React, { useState } from 'react';
import { Dialogue } from '../types/GameTypes';

interface DialogueBoxProps {
  dialogues: Dialogue[];
  onComplete: () => void;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({ dialogues, onComplete }) => {
  const [index, setIndex] = useState(0);
  const current = dialogues[index];

  const handleNext = () => {
    if (index + 1 < dialogues.length) {
      setIndex(index + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="dialogue-box" style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0, 0, 0, 0.7)',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      maxWidth: '80%',
      textAlign: 'center'
    }}>
      <p><strong>{current.speaker}:</strong> {current.text}</p>
      <button onClick={handleNext} style={{
        marginTop: '8px',
        padding: '8px 16px',
        background: '#0f0',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>▶ Next</button>
    </div>
  );
};

export default DialogueBox;
