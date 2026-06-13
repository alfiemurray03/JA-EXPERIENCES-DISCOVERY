import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LogoJumpGameProps {
  isOpen: boolean;
  onClose: () => void;
  gameMode: 'land' | 'flying';
}

export default function LogoJumpGame({ isOpen, onClose, gameMode }: LogoJumpGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerY, setPlayerY] = useState(300);
  const [playerX, setPlayerX] = useState(100); // For driving mode
  const [isJumping, setIsJumping] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [obstacles, setObstacles] = useState<{ id: number; x: number; height: number; lane?: number; scored: boolean }[]>([]);
  const [velocity, setVelocity] = useState(0);
  const [jumpCount, setJumpCount] = useState(0);
  const [isHoldingJump, setIsHoldingJump] = useState(false);
  const [holdStartTime, setHoldStartTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [outOfBoundsTimer, setOutOfBoundsTimer] = useState<number | null>(null);
  const [currentLane, setCurrentLane] = useState(1); // 0=left, 1=center, 2=right
  const gameLoopRef = useRef<number>();
  const obstacleIdRef = useRef(0);
  const outOfBoundsStartRef = useRef<number | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ESC key to close game
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent background scroll when game is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
      };
    }
  }, [isOpen]);

  const GRAVITY = gameMode === 'land' ? 0.6 : 0.4;
  const JUMP_FORCE = gameMode === 'land' ? -12 : -8;
  const HIGH_JUMP_FORCE = -16;
  const DOUBLE_JUMP_FORCE = -11;
  const FLY_FORCE = -0.5;
  const GROUND_Y = 300;
  const PLAYER_SIZE = 80;
  const OBSTACLE_WIDTH = 40;
  const BASE_GAME_SPEED = 3;
  const MAX_GAME_SPEED = 12;
  const SPEED_INCREASE_INTERVAL = 25;
  const MAX_HOLD_TIME = 200;
  const OUT_OF_BOUNDS_TIME = 3000;
  const GAME_HEIGHT = 400;
  const LANE_WIDTH = 150;
  const LANE_POSITIONS = [50, 200, 350]; // X positions for 3 lanes
  
  const getCurrentSpeed = () => {
    const speedLevel = Math.floor(score / SPEED_INCREASE_INTERVAL);
    const currentSpeed = BASE_GAME_SPEED + (speedLevel * 1.5);
    return Math.min(currentSpeed, MAX_GAME_SPEED);
  };

  // Load high score
  useEffect(() => {
    const storageKey = `logoJumpHighScore_${gameMode}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) setHighScore(parseInt(saved));
  }, [gameMode]);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      const storageKey = `logoJumpHighScore_${gameMode}`;
      localStorage.setItem(storageKey, score.toString());
    }
  }, [score, highScore, gameMode]);

  // Handle jump/fly
  const jump = () => {
    if (!gameStarted || gameOver) return;
    if (gameMode === 'driving') return; // No jumping in driving mode
    
    if (gameMode === 'land') {
      if (playerY >= GROUND_Y - 5) {
        setIsHoldingJump(true);
        setHoldStartTime(Date.now());
        setJumpCount(0);
      } else if (jumpCount < 1 && isJumping) {
        setVelocity(DOUBLE_JUMP_FORCE);
        setJumpCount(1);
      }
    } else {
      setIsFlying(true);
      setVelocity(FLY_FORCE);
    }
  };

  const releaseJump = () => {
    if (gameMode === 'land' && isHoldingJump) {
      const holdDuration = Date.now() - holdStartTime;
      const jumpForce = holdDuration >= MAX_HOLD_TIME ? HIGH_JUMP_FORCE : JUMP_FORCE;
      setVelocity(jumpForce);
      setIsJumping(true);
      setIsHoldingJump(false);
    }
  };

  const stopFlying = () => {
    setIsFlying(false);
  };

  // Driving mode lane switching
  const switchLane = (direction: 'left' | 'right') => {
    if (!gameStarted || gameOver || gameMode !== 'driving') return;
    
    setCurrentLane((lane) => {
      if (direction === 'left' && lane > 0) return lane - 1;
      if (direction === 'right' && lane < 2) return lane + 1;
      return lane;
    });
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setPlayerY(GROUND_Y);
    setPlayerX(100);
    setCurrentLane(1);
    setVelocity(0);
    setIsJumping(false);
    setIsFlying(false);
    setJumpCount(0);
    setIsHoldingJump(false);
    setOutOfBoundsTimer(null);
    setObstacles([]);
    obstacleIdRef.current = 0;
    outOfBoundsStartRef.current = null;
  };

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = () => {
      // Update player position
      if (gameMode !== 'driving') {
        setVelocity((v) => {
          if (gameMode === 'flying' && isFlying) {
            return v + FLY_FORCE;
          }
          return v + GRAVITY;
        });
        setPlayerY((y) => {
          const newY = y + velocity;
          
          if (newY >= GROUND_Y) {
            setIsJumping(false);
            setJumpCount(0);
            return GROUND_Y;
          }
          
          if (gameMode === 'flying') {
            if (newY < -PLAYER_SIZE) {
              if (outOfBoundsStartRef.current === null) {
                outOfBoundsStartRef.current = Date.now();
              }
              
              const timeOutOfBounds = Date.now() - outOfBoundsStartRef.current;
              const remainingTime = Math.max(0, OUT_OF_BOUNDS_TIME - timeOutOfBounds);
              setOutOfBoundsTimer(Math.ceil(remainingTime / 1000));
              
              if (timeOutOfBounds >= OUT_OF_BOUNDS_TIME) {
                setGameOver(true);
              }
              
              return newY;
            } else {
              if (outOfBoundsStartRef.current !== null) {
                outOfBoundsStartRef.current = null;
                setOutOfBoundsTimer(null);
              }
            }
            
            if (newY >= GROUND_Y + PLAYER_SIZE) {
              setGameOver(true);
              return GROUND_Y + PLAYER_SIZE;
            }
          }
          
          return newY;
        });
      } else {
        // Driving mode - smooth lane transitions
        setPlayerX((x) => {
          const targetX = LANE_POSITIONS[currentLane];
          const diff = targetX - x;
          if (Math.abs(diff) < 5) return targetX;
          return x + diff * 0.2;
        });
      }

      // Update obstacles
      setObstacles((obs) => {
        const currentSpeed = getCurrentSpeed();
        const updated = obs
          .map((o) => ({ ...o, x: o.x - currentSpeed }))
          .filter((o) => o.x > -OBSTACLE_WIDTH);

        // Add new obstacle
        if (updated.length === 0 || updated[updated.length - 1].x < 400) {
          if (gameMode === 'driving') {
            // Driving mode: obstacles in random lanes
            const lane = Math.floor(Math.random() * 3);
            updated.push({
              id: obstacleIdRef.current++,
              x: 600,
              height: 60,
              lane,
              scored: false,
            });
          } else if (gameMode === 'land') {
            const minHeight = 40;
            const maxHeight = 80;
            const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
            updated.push({
              id: obstacleIdRef.current++,
              x: 600,
              height,
              scored: false,
            });
          } else {
            const minHeight = 60;
            const maxHeight = 100;
            const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
            updated.push({
              id: obstacleIdRef.current++,
              x: 600,
              height,
              scored: false,
            });
          }
        }

        return updated;
      });

      // Check collision and scoring
      setObstacles((currentObstacles) => {
        return currentObstacles.map((obstacle) => {
          let playerLeft, playerRight, playerTop, playerBottom;
          
          if (gameMode === 'driving') {
            playerLeft = playerX;
            playerRight = playerX + PLAYER_SIZE;
            playerTop = GROUND_Y;
            playerBottom = GROUND_Y + PLAYER_SIZE;
          } else {
            playerLeft = 100;
            playerRight = 100 + PLAYER_SIZE;
            playerTop = playerY;
            playerBottom = playerY + PLAYER_SIZE;
          }

          const obstacleLeft = obstacle.x;
          const obstacleRight = obstacle.x + OBSTACLE_WIDTH;
          
          let obstacleTop, obstacleBottom;
          if (gameMode === 'driving') {
            const laneY = LANE_POSITIONS[obstacle.lane!];
            obstacleTop = laneY;
            obstacleBottom = laneY + obstacle.height;
          } else if (gameMode === 'land') {
            obstacleTop = GROUND_Y + PLAYER_SIZE - obstacle.height;
            obstacleBottom = GROUND_Y + PLAYER_SIZE;
          } else {
            const randomY = (obstacle.id * 73) % 250;
            obstacleTop = randomY;
            obstacleBottom = randomY + obstacle.height;
          }

          // Check collision
          if (
            playerRight > obstacleLeft &&
            playerLeft < obstacleRight &&
            playerBottom > obstacleTop &&
            playerTop < obstacleBottom
          ) {
            setGameOver(true);
          }

          // Increase score
          if (!obstacle.scored && obstacle.x + OBSTACLE_WIDTH < (gameMode === 'driving' ? playerX : 100)) {
            setScore((s) => s + 1);
            return { ...obstacle, scored: true };
          }

          return obstacle;
        });
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, velocity, playerY, playerX, currentLane, obstacles, gameMode]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameMode === 'driving') {
        if (e.code === 'ArrowLeft') {
          e.preventDefault();
          switchLane('left');
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          switchLane('right');
        }
      } else {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          e.preventDefault();
          jump();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameMode !== 'driving' && (e.code === 'Space' || e.code === 'ArrowUp')) {
        e.preventDefault();
        if (gameMode === 'flying') {
          stopFlying();
        } else if (gameMode === 'land') {
          releaseJump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver, playerY, gameMode, isHoldingJump, holdStartTime, jumpCount, isJumping, currentLane]);

  if (!isOpen) return null;

  const getGameTitle = () => {
    switch (gameMode) {
      case 'land': return '🎮 Logo Jump Game';
      case 'flying': return '✈️ Logo Flying Game';
      case 'driving': return '🚗 Logo Racing Game';
    }
  };

  const getGameInstructions = () => {
    switch (gameMode) {
      case 'land': return 'Click or press SPACE to jump and avoid obstacles!';
      case 'flying': return 'Click or press SPACE to fly up and avoid obstacles!';
      case 'driving': return 'Use Arrow Keys or click lanes to switch and avoid obstacles!';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        style={{ 
          touchAction: 'none',
          userSelect: 'none',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white shadow-2xl overflow-hidden"
          style={{
            width: isMobile ? '95vw' : '90vw',
            maxWidth: '1200px',
            height: isMobile ? '90vh' : '85vh',
            borderRadius: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0A1F44] to-[#2563EB] text-white relative flex-shrink-0"
            style={{ padding: isMobile ? '1rem' : '1.5rem' }}
          >
            <button
              onClick={onClose}
              className="absolute text-white/80 hover:text-white transition-colors z-20"
              style={{
                top: isMobile ? '0.75rem' : '1rem',
                right: isMobile ? '0.75rem' : '1rem',
                padding: '0.5rem',
              }}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="font-bold mb-2 pr-12"
              style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}
            >
              {getGameTitle()}
            </h2>
            <p className="text-white/80"
              style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
              {getGameInstructions()}
            </p>
          </div>

          {/* Game Area - Centered and Full */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '1rem' : '2rem',
            backgroundColor: '#f8f9fa',
          }}>
            <div
              className="relative bg-gradient-to-b from-sky-200 to-sky-100 overflow-hidden cursor-pointer"
              style={{ 
                width: '100%',
                height: '100%',
                maxHeight: '600px',
                borderRadius: '1rem',
                touchAction: 'none',
              }}
              onMouseDown={(e) => {
                if (gameOver || !gameStarted) return;
                if (gameMode === 'driving') {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const width = rect.width;
                  if (clickX < width / 3) switchLane('left');
                  else if (clickX > (width * 2) / 3) switchLane('right');
                } else {
                  jump();
                }
              }}
              onMouseUp={(e) => {
                if (gameOver || !gameStarted || gameMode === 'driving') return;
                if (gameMode === 'flying') stopFlying();
                else releaseJump();
              }}
              onTouchStart={(e) => {
                if (gameOver || !gameStarted) return;
                e.preventDefault();
                if (gameMode === 'driving') {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const touch = e.touches[0];
                  const clickX = touch.clientX - rect.left;
                  const width = rect.width;
                  if (clickX < width / 3) switchLane('left');
                  else if (clickX > (width * 2) / 3) switchLane('right');
                } else {
                  jump();
                }
              }}
              onTouchEnd={(e) => {
                if (gameOver || !gameStarted || gameMode === 'driving') return;
                e.preventDefault();
                if (gameMode === 'flying') stopFlying();
                else releaseJump();
              }}
            >
              {/* Score Display */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg z-10">
                <div className="text-2xl font-bold text-[#0A1F44]">Score: {score}</div>
                <div className="text-xs text-[#0A1F44]/60">High Score: {highScore}</div>
                {score >= SPEED_INCREASE_INTERVAL && (
                  <div className="text-xs text-orange-600 font-semibold mt-1 flex items-center gap-1">
                    <span>⚡</span>
                    <span>Speed Level {Math.floor(score / SPEED_INCREASE_INTERVAL)}</span>
                  </div>
                )}
              </div>

              {/* Out of Bounds Warning */}
              {outOfBoundsTimer !== null && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <div className="bg-red-600 text-white rounded-2xl shadow-2xl border-4 border-red-400 p-8 text-center">
                    <div className="text-6xl font-bold mb-2">{outOfBoundsTimer}</div>
                    <div className="text-xl font-semibold">⚠️ RETURN TO SCREEN!</div>
                    <div className="mt-1 opacity-90">Fly back down now!</div>
                  </div>
                </motion.div>
              )}

              {/* Ground/Road */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-green-600 to-green-700" />
              {gameMode === 'driving' && (
                <>
                  {/* Lane markers */}
                  <div className="absolute bottom-20 left-0 right-0 h-1 bg-yellow-400" />
                  <div className="absolute bottom-0 left-0 right-0 h-20">
                    <div className="absolute left-1/3 top-0 bottom-0 w-1 bg-white/50" />
                    <div className="absolute left-2/3 top-0 bottom-0 w-1 bg-white/50" />
                  </div>
                </>
              )}

              {/* Player */}
              {gameStarted && (
                <motion.div
                  className="absolute"
                  style={{
                    left: gameMode === 'driving' ? `${playerX}px` : '100px',
                    top: gameMode === 'driving' ? `${GROUND_Y}px` : `${playerY}px`,
                    width: `${PLAYER_SIZE}px`,
                    height: `${PLAYER_SIZE}px`,
                  }}
                  animate={{
                    rotate: gameMode === 'land' 
                      ? (isJumping ? -20 : 0)
                      : gameMode === 'flying'
                      ? (velocity < -2 ? -15 : velocity > 2 ? 15 : 0)
                      : 0,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  <img
                    src="/images/367f316379e78929865b1677b6370686.jpg"
                    alt="Player"
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </motion.div>
              )}

              {/* Obstacles */}
              {obstacles.map((obstacle) => {
                let obstacleStyle: React.CSSProperties = {
                  left: `${obstacle.x}px`,
                  width: `${OBSTACLE_WIDTH}px`,
                  height: `${obstacle.height}px`,
                  backgroundColor: obstacle.scored ? '#10b981' : '#dc2626',
                };

                if (gameMode === 'driving') {
                  obstacleStyle = {
                    ...obstacleStyle,
                    top: `${LANE_POSITIONS[obstacle.lane!]}px`,
                    borderRadius: '8px',
                  };
                } else if (gameMode === 'land') {
                  obstacleStyle = {
                    ...obstacleStyle,
                    bottom: '80px',
                    borderRadius: '8px 8px 0 0',
                  };
                } else {
                  const randomY = (obstacle.id * 73) % 250;
                  obstacleStyle = {
                    ...obstacleStyle,
                    top: `${randomY}px`,
                    borderRadius: '8px',
                  };
                }

                return (
                  <div
                    key={obstacle.id}
                    className="absolute shadow-lg transition-colors"
                    style={obstacleStyle}
                  />
                );
              })}

              {/* Start Screen */}
              {!gameStarted && !gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <div className="text-center p-8">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Button
                        onClick={startGame}
                        size="lg"
                        className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white text-xl px-12 py-6"
                      >
                        🎮 Start Game
                      </Button>
                    </motion.div>
                    <p className="mt-6 text-[#0A1F44] font-semibold text-lg">
                      {gameMode === 'driving' ? 'Use Arrow Keys or Click Lanes!' : 'Click or press SPACE!'}
                    </p>
                  </div>
                </div>
              )}

              {/* Game Over Screen */}
              {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl text-center shadow-2xl p-8 max-w-md"
                  >
                    <div className="text-6xl mb-4">💥</div>
                    <h3 className="text-3xl font-bold text-[#0A1F44] mb-2">Game Over!</h3>
                    <div className="text-5xl font-bold text-[#2563EB] mb-2">{score}</div>
                    <p className="text-[#0A1F44]/60 mb-6 text-lg">High Score: {highScore}</p>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={startGame}
                        className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white px-6 py-3"
                      >
                        🔄 Play Again
                      </Button>
                      <Button
                        onClick={onClose}
                        variant="outline"
                        className="border-[#0A1F44] text-[#0A1F44] px-6 py-3"
                      >
                        Close
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}