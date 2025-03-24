"use client";

import { useEffect, useRef, useState } from 'react';

interface CamScreenProps {
  isPlaying: boolean;
  isMuted: boolean;
  isSelfieMode: boolean;
  onVideoRef: (ref: HTMLVideoElement | null) => void;
  onTimeUpdate: () => void;
  onDurationChange: () => void;
  onError: (message: string) => void;
}

const CamScreen = ({
  isPlaying,
  isMuted,
  isSelfieMode,
  onVideoRef,
  onTimeUpdate,
  onDurationChange,
  onError
}: CamScreenProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraLoaded, setCameraLoaded] = useState(false);
  
  // Initialize camera only once
  useEffect(() => {
    let mounted = true;
    
    const startCamera = async () => {
      try {
        // Only initialize if not already set up
        if (!streamRef.current) {
          // We'll request different constraints for selfie mode vs normal mode
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
              facingMode: 'user', // Always use front camera for mobile
              width: { ideal: isSelfieMode ? 1920 : 1280 },
              height: { ideal: isSelfieMode ? 1080 : 720 },
            }, 
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
                videoRef.current.play().catch(err => {
                  console.error('Play error after metadata load:', err);
                  onError('Could not start camera. Please check permissions.');
                });
              }
              setCameraLoaded(true);
            };
          }
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        onError('Could not access camera. Please check permissions and ensure no other app is using it.');
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
        onError('Error controlling playback. Please reload the app.');
      }
    };
    
    handlePlayPause();
  }, [isPlaying, onError]);

  // Method to capture a high-resolution selfie
  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    // Set canvas dimensions to video dimensions for full resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert the canvas to a blob
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        }, 
        'image/jpeg', 
        0.95 // High quality
      );
    });
  };

  // Make the capture method available to parent components
  useEffect(() => {
    if (videoRef.current) {
      // Add the captureSelfie method to the video element
      (videoRef.current as HTMLVideoElement & { captureSelfie: typeof captureSelfie }).captureSelfie = captureSelfie;
    }
  }, [cameraLoaded]);

  return (
    <>
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-lg"
        playsInline // Important for mobile devices
        onTimeUpdate={onTimeUpdate}
        onDurationChange={onDurationChange}
      />
      {/* Hidden canvas for capturing images */}
      <canvas 
        ref={canvasRef} 
        className="hidden"
      />
    </>
  );
};

export default CamScreen;