import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SpinWheel = ({ prizes, onSpin, isSpinning, canSpin }) => {
  const wheelRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const segmentAngle = 360 / prizes?.length;

  const handleSpin = () => {
    if (!canSpin || isSpinning || isAnimating) return;

    setIsAnimating(true);
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const finalRotation = spins * 360 + Math.random() * 360;
    const newRotation = rotation + finalRotation;
    
    setRotation(newRotation);
    
    // Calculate winning segment
    const normalizedRotation = (360 - (newRotation % 360)) % 360;
    const winningIndex = Math.floor(normalizedRotation / segmentAngle);
    const winningPrize = prizes?.[winningIndex];

    setTimeout(() => {
      setIsAnimating(false);
      onSpin(winningPrize);
    }, 4000);
  };

  const getSegmentColor = (index, type) => {
    const colors = {
      cash: ['#10b981', '#059669'], // emerald
      bonus: ['#f59e0b', '#d97706'], // amber
      multiplier: ['#8b5cf6', '#7c3aed'], // violet
      special: ['#ef4444', '#dc2626'] // red
    };
    return colors?.[type] || colors?.cash;
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Wheel Container */}
      <div className="relative w-80 h-80 sm:w-96 sm:h-96">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-white drop-shadow-lg"></div>
        </div>

        {/* Wheel */}
        <div 
          ref={wheelRef}
          className={`relative w-full h-full rounded-full border-8 border-white shadow-2xl transition-transform duration-[4000ms] ease-out ${
            isAnimating ? 'animate-spin' : ''
          }`}
          style={{ 
            transform: `rotate(${rotation}deg)`,
            background: 'conic-gradient(from 0deg, #10b981 0deg 45deg, #f59e0b 45deg 90deg, #8b5cf6 90deg 135deg, #ef4444 135deg 180deg, #10b981 180deg 225deg, #f59e0b 225deg 270deg, #8b5cf6 270deg 315deg, #ef4444 315deg 360deg)'
          }}
        >
          {/* Prize Segments */}
          {prizes?.map((prize, index) => {
            const angle = index * segmentAngle;
            const colors = getSegmentColor(index, prize?.type);
            
            return (
              <div
                key={index}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `rotate(${angle}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((segmentAngle * Math.PI) / 180)}%)`
                }}
              >
                <div 
                  className="w-full h-full flex items-center justify-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${colors?.[0]}, ${colors?.[1]})`
                  }}
                >
                  <div 
                    className="text-white font-bold text-xs sm:text-sm text-center absolute"
                    style={{
                      transform: `rotate(${segmentAngle / 2}deg) translateY(-60px)`,
                      transformOrigin: 'center'
                    }}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <Icon name={prize?.icon} size={16} color="white" />
                      <span>${prize?.amount}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Center Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-gray-200">
              <Icon name="Gift" size={24} className="text-primary" />
            </div>
          </div>
        </div>
      </div>
      {/* Spin Button */}
      <div className="mt-8">
        <Button
          variant="default"
          size="lg"
          onClick={handleSpin}
          disabled={!canSpin || isSpinning || isAnimating}
          loading={isSpinning || isAnimating}
          className="px-8 py-4 text-lg font-bold bg-gradient-primary hover:scale-105 transition-transform duration-200 shadow-lg"
        >
          {isAnimating ? 'Spinning...' : canSpin ? 'Spin Now!' : 'No Spins Left'}
        </Button>
      </div>
      {/* Spin Status */}
      <div className="mt-4 text-center">
        {canSpin ? (
          <p className="text-sm text-text-secondary">
            Good luck! Tap the button to spin the wheel
          </p>
        ) : (
          <p className="text-sm text-warning">
            Come back tomorrow for more spins!
          </p>
        )}
      </div>
    </div>
  );
};

export default SpinWheel;