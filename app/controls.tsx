"use client";

import { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  isRecording: boolean;
  isFullscreen: boolean;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onRecordToggle: () => void;
  onFullscreenToggle: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const VideoControls = ({
  isPlaying,
  isMuted,
  isRecording,
  isFullscreen,
  onPlayPause,
  onMuteToggle,
  onRecordToggle,
  onFullscreenToggle,
  currentTime,
  duration,
  onSeek
}: VideoControlsProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle mouse movement to show controls
  useEffect(() => {
    const handleMouseMove = () => {
      setIsVisible(true);
      
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Set a new timeout to hide controls after 3 seconds
      const id = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      
      setTimeoutId(id);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchstart', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchstart', handleMouseMove);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <>
      {/* Sketch grid background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full border-4 border-gray-700 border-dashed opacity-10 
                       dark:border-white rounded-lg" 
             style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(120, 120, 120, 0.2) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(120, 120, 120, 0.2) 20px)' }}>
        </div>
      </div>
    
      {/* Record button (always visible) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <button 
          onClick={onRecordToggle}
          className={`${isRecording ? 'bg-red-600 scale-95' : 'bg-white dark:bg-gray-800'} 
                    w-16 h-16 rounded-full flex items-center justify-center
                    transform transition-all duration-200 shadow-lg hover:scale-105
                    border-2 border-gray-800 dark:border-gray-200 
                    ${isRecording ? 'animate-pulse' : ''}`}
          style={{ 
            transform: 'rotate(-2deg)',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.2)'
          }}
          aria-label={isRecording ? "Stop Recording" : "Start Recording"}
        >
          <div className={`${isRecording ? 'bg-white' : 'bg-red-600'} 
                          w-8 h-8 rounded-sm transition-all duration-300
                          ${isRecording ? 'scale-75' : 'rounded-full'}`}
                style={{ transform: 'rotate(2deg)' }}>
          </div>
        </button>
      </div>
      
      {/* Controls overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 transition-opacity duration-300 
                    ${isVisible ? 'opacity-100' : 'opacity-0'} rounded-b-lg sketch-border`}
        style={{ 
          borderTop: 'none',
          paddingBottom: '5rem' // Make room for record button
        }}
      >
        {/* Progress bar */}
        <div className="w-full mb-3">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime || 0}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
            style={{ 
              background: 'rgba(255,255,255,0.2)',
              boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.4)'
            }}
          />
          <div className="flex justify-between text-white text-xs mt-1 font-mono"
               style={{ transform: 'rotate(-0.5deg)' }}>
            <span className="sketch-text">{formatTime(currentTime)}</span>
            <span className="sketch-text">{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause button */}
            <button 
              onClick={onPlayPause}
              className="text-white bg-gray-800 bg-opacity-60 p-2 rounded-full hover:bg-opacity-80 transition-colors sketch-button"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
            </button>
            
            {/* Mute button */}
            <button 
              onClick={onMuteToggle}
              className="text-white bg-gray-800 bg-opacity-60 p-2 rounded-full hover:bg-opacity-80 transition-colors sketch-button"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <FaMicrophoneSlash size={18} /> : <FaMicrophone size={18} />}
            </button>
          </div>
          
          <div>
            {/* Fullscreen button */}
            <button 
              onClick={onFullscreenToggle}
              className="text-white bg-gray-800 bg-opacity-60 p-2 rounded-full hover:bg-opacity-80 transition-colors sketch-button"
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <MdFullscreenExit size={20} /> : <MdFullscreen size={20} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoControls;