"use client";

import { useState, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaCamera,
} from "react-icons/fa";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  isRecording: boolean;
  isFullscreen: boolean;
  isSelfieMode: boolean;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onRecordToggle: () => void;
  onFullscreenToggle: () => void;
  onSelfieCapture: () => void;
  onToggleSelfieMode: () => void;
  currentTime: number;
}

const VideoControls = ({
  isPlaying,
  isMuted,
  isRecording,
  isFullscreen,
  isSelfieMode,
  onPlayPause,
  onMuteToggle,
  onRecordToggle,
  onFullscreenToggle,
  onSelfieCapture,
  onToggleSelfieMode,
  currentTime,
}: VideoControlsProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Modify the useEffect to keep controls visible all the time for mobile visibility
  useEffect(() => {
    // For mobile, we'll keep controls visible
    if (window.innerWidth < 768) {
      setIsVisible(true);
      return;
    }

    // For larger screens, hide after timeout
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

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchstart", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchstart", handleMouseMove);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <>
      {/* Selfie mode indicator */}
      {isSelfieMode && (
        <div className="selfie-mode-indicator">
          <FaCamera size={12} />
          <span>Selfie Mode</span>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute top-1 right-1 flex items-center bg-red-600 px-3 py-1 rounded-full z-30">
          <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
          <span className="text-white text-sm font-bold">Recording</span>
        </div>
      )}

      {/* Sketch grid background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="w-full h-full border-4 border-[#FF5A5F] border-dashed opacity-20 
                       rounded-lg"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255, 255, 255, 0.15) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255, 255, 255, 0.15) 20px)",
          }}
        ></div>
      </div>

      {/* Record button (always visible) */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30">
        {isSelfieMode ? (
          <button
            onClick={onSelfieCapture}
            className="bg-white dark:bg-gray-800 
                     w-16 h-16 rounded-full flex items-center justify-center
                     transform transition-all duration-200 shadow-lg hover:scale-105
                     border-2 border-[#6C63FF] dark:border-[#6C63FF]"
            style={{
              transform: "rotate(-2deg)",
              boxShadow:
                "3px 3px 0 rgba(0,0,0,0.2), 0 0 15px rgba(108, 99, 255, 0.5)",
            }}
            aria-label="Take Selfie"
          >
            <div
              className="bg-indigo-600 w-8 h-8 rounded-full transition-all duration-300"
              style={{ transform: "rotate(2deg)" }}
            ></div>
          </button>
        ) : (
          <button
            onClick={onRecordToggle}
            className={`${
              isRecording ? "bg-red-600 scale-95" : "bg-white dark:bg-gray-800"
            } 
                     w-16 h-16 rounded-full flex items-center justify-center
                     transform transition-all duration-200 shadow-lg hover:scale-105
                     border-2 border-[#FF5A5F] dark:border-[#FF5A5F] 
                     ${isRecording ? "animate-pulse" : ""}`}
            style={{
              transform: "rotate(-2deg)",
              boxShadow:
                "3px 3px 0 rgba(0,0,0,0.2), 0 0 15px rgba(255, 90, 95, 0.5)",
            }}
            aria-label={isRecording ? "Stop Recording" : "Start Recording"}
          >
            <div
              className={`${isRecording ? "bg-white" : "bg-red-600"} 
                          w-8 h-8 rounded-sm transition-all duration-300
                          ${isRecording ? "scale-75" : "rounded-full"}`}
              style={{ transform: "rotate(2deg)" }}
            ></div>
          </button>
        )}
      </div>

      {/* Recording timer - Positioned directly above the record button when recording */}
      {isRecording && (
        <div className="absolute bottom-[120px] left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-red-600 text-white text-xl font-mono px-4 py-1 rounded-full animate-pulse shadow-lg">
            <span className="flex items-center whitespace-nowrap">
              REC <span className="mx-2">•</span> {formatTime(currentTime)}
            </span>
          </div>
        </div>
      )}

      {/* Controls overlay - Now always visible on mobile */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 
                    ${isVisible ? "opacity-100" : "opacity-0"} rounded-b-lg`}
        style={{
          borderTop: "none",
          paddingBottom: "5rem", // More room for record button
          height: "23.5%", // Ensure overlay covers enough area
        }}
      >
        {/* Control buttons - Make them more visible */}
        <div className="flex items-center justify-between control-buttons mt-2 relative z-20">
          <div className="flex items-center space-x-4">
            {/* Play/Pause button */}
            <button
              onClick={onPlayPause}
              className="text-white bg-[#FF5A5F] p-3 rounded-full hover:bg-opacity-90 transition-colors sketch-button"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
            </button>

            {/* Mute button */}
            <button
              onClick={onMuteToggle}
              className="text-white bg-[#6C63FF] p-3 rounded-full hover:bg-opacity-90 transition-colors sketch-button"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {" "}
            {/* Selfie mode toggle */}
            {!isRecording && (
              <button
                onClick={onToggleSelfieMode}
                className={`text-white ${
                  isSelfieMode ? "bg-[#FFC107]" : "bg-gray-800"
                } p-3 rounded-full hover:bg-opacity-90 transition-colors sketch-button`}
                aria-label={isSelfieMode ? "Exit Selfie Mode" : "Selfie Mode"}
              >
                <FaCamera size={18} />
              </button>
            )}
            {/* Fullscreen button */}
            <button
              onClick={onFullscreenToggle}
              className="text-white bg-gray-800 p-3 rounded-full hover:bg-opacity-90 transition-colors sketch-button"
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <MdFullscreenExit size={20} />
              ) : (
                <MdFullscreen size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoControls;
