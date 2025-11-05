import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Gift, Star, Coins, Zap } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import { cn } from '../../utils/cn';

const SpinWheel = ({ 
  prizes = [], 
  onSpin, 
  onResult, 
  disabled = false,
  className 
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const controls = useAnimation();
  const wheelRef = useRef(null);

  const defaultPrizes = [
    { id: 1, label: '$5', value: 5, color: '#FF6B6B', icon: Coins },
    { id: 2, label: '$10', value: 10, color: '#4ECDC4', icon: Coins },
    { id: 3, label: '$25', value: 25, color: '#45B7D1', icon: Star },
    { id: 4, label: '$50', value: 50, color: '#96CEB4', icon: Gift },
    { id: 5, label: '$100', value: 100, color: '#FFEAA7', icon: Zap },
    { id: 6, label: 'Try Again', value: 0, color: '#DDA0DD', icon: null },
    { id: 7, label: '$15', value: 15, color: '#FFB6C1', icon: Coins },
    { id: 8, label: '$30', value: 30, color: '#98D8C8', icon: Star }
  ];

  const wheelPrizes = prizes.length > 0 ? prizes : defaultPrizes;
  const segmentAngle = 360 / wheelPrizes.length;

  const handleSpin = async () => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);
    onSpin?.();

    // Generate random result
    const randomIndex = Math.floor(Math.random() * wheelPrizes.length);
    const selectedPrize = wheelPrizes[randomIndex];
    
    // Calculate rotation angle
    const baseRotation = 360 * 5; // 5 full rotations
    const targetAngle = (randomIndex * segmentAngle) + (segmentAngle / 2);
    const finalRotation = baseRotation + (360 - targetAngle);

    // Animate the wheel
    await controls.start({
      rotate: finalRotation,
      transition: {
        duration: 3,
        ease: [0.23, 1, 0.32, 1],
      }
    });

    setResult(selectedPrize);
    setIsSpinning(false);
    onResult?.(selectedPrize);
  };

  const resetWheel = () => {
    setResult(null);
    controls.set({ rotate: 0 });
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Gift className="w-6 h-6 text-primary" />
          Daily Spin Wheel
        </CardTitle>
        {result && (
          <Badge variant="success" className="mx-auto">
            You won: {result.label}!
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Wheel Container */}
        <div className="relative w-80 h-80 mx-auto">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary" />
          </div>

          {/* Wheel */}
          <motion.div
            ref={wheelRef}
            animate={controls}
            className="relative w-full h-full rounded-full border-4 border-primary shadow-2xl overflow-hidden"
            style={{ transformOrigin: 'center center' }}
          >
            {wheelPrizes.map((prize, index) => {
              const rotation = index * segmentAngle;
              const IconComponent = prize.icon;
              
              return (
                <div
                  key={prize.id}
                  className="absolute w-full h-full"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((segmentAngle * Math.PI) / 180)}%)`
                  }}
                >
                  <div
                    className="w-full h-full flex items-start justify-center pt-8"
                    style={{ backgroundColor: prize.color }}
                  >
                    <div 
                      className="text-center text-white font-bold"
                      style={{ transform: `rotate(${segmentAngle / 2}deg)` }}
                    >
                      {IconComponent && <IconComponent className="w-6 h-6 mx-auto mb-1" />}
                      <div className="text-sm">{prize.label}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10">
            <Gift className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Spin Button */}
        <div className="text-center space-y-4">
          <Button
            onClick={handleSpin}
            disabled={isSpinning || disabled}
            size="lg"
            className="w-full"
          >
            {isSpinning ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              'Spin the Wheel!'
            )}
          </Button>

          {result && (
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={resetWheel}
                className="w-full"
              >
                Spin Again Tomorrow
              </Button>
              <p className="text-sm text-muted-foreground">
                Come back tomorrow for another spin!
              </p>
            </div>
          )}
        </div>

        {/* Prize List */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {wheelPrizes.map((prize, index) => (
            <div
              key={prize.id}
              className="flex items-center gap-2 p-2 rounded-lg"
              style={{ backgroundColor: `${prize.color}20` }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: prize.color }}
              />
              <span className="font-medium">{prize.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpinWheel;
