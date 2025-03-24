"use client";

import { useEffect, useRef } from 'react';

interface CamScreenProps {
  isPlaying: boolean;
  isMuted: boolean;
  onVideoRef: (ref: HTMLVideoElement | null) => void;
  onTimeUpdate: () => void;
  onDurationChange: () => void;
}

const CamScreen = ({
  isPlaying,
  isMuted,
  onVideoRef,
  onTimeUpdate,
  onDurationChange
}: CamScreenProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Initialize camera only once
  useEffect(() => {
    let mounted = true;
    
    const startCamera = async () => {
      try {
        // Only initialize if not already set up
        if (!streamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
          
          streamRef.current = stream;
          
          if (videoRef.current && mounted) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = isMuted; // Set initial mute state
            
            // Register video element with parent
            onVideoRef(videoRef.current);
            
            // Wait for metadata to load before attempting play
            videoRef.current.onloadedmetadata = () => {
              if (isPlaying && videoRef.current) {
                videoRef.current.play().catch(err => 
                  console.error('Play error after metadata load:', err)
                );
              }
            };
          }
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    startCamera();

    return () => {
      mounted = false;
      
      // Clean up the stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this only runs once

  // Handle mute state changes separately
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle play/pause state changes separately
  useEffect(() => {
    const handlePlayPause = async () => {
      if (!videoRef.current || !videoRef.current.srcObject) return;
      
      try {
        if (isPlaying) {
          // Only play if it's actually paused
          if (videoRef.current.paused) {
            await videoRef.current.play();
          }
        } else {
          videoRef.current.pause();
        }
      } catch (err) {
        console.error('Play/pause error:', err);
      }
    };
    
    handlePlayPause();
  }, [isPlaying]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover rounded-lg"
      playsInline // Important for mobile devices
      onTimeUpdate={onTimeUpdate}
      onDurationChange={onDurationChange}
    />
  );
};

export default CamScreen;