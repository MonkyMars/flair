"use client";

import { useState, useRef, useEffect } from "react";
import CamScreen from "./camera";
import VideoControls from "./controls";

const Home = () => {
  // Video control states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Refs for video and recording
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Handle play/pause toggle
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };
  
  // Handle mute toggle
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };
  
  // Handle record toggle
  const handleRecordToggle = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    } else {
      // Start recording
      try {
        recordedChunksRef.current = [];
        
        if (videoRef.current) {
          // Make sure we're getting the stream directly from the source
          const stream = videoRef.current.srcObject as MediaStream;
          
          // Check if the stream is active
          if (!stream || stream.getVideoTracks().length === 0 || !stream.getVideoTracks()[0].enabled) {
            throw new Error("Stream is not active");
          }
          
          // Check for supported MIME types
          const supportedMimeTypes = [
            'video/webm;codecs=vp9', 
            'video/webm;codecs=vp8', 
            'video/webm', 
            'video/mp4'
          ];
          
          let options = {};
          let mimeType = '';
          
          // Find the first supported MIME type
          for (const type of supportedMimeTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
              mimeType = type;
              options = { mimeType };
              console.log(`Using MIME type: ${mimeType}`);
              break;
            }
          }
          
          // Create the media recorder with the supported type, or with default options if none found
          const mediaRecorder = new MediaRecorder(stream, options);
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            if (recordedChunksRef.current.length === 0) {
              console.error("No data was recorded");
              return;
            }
            
            // Determine the correct file type based on the MIME type used
            const fileType = mimeType.startsWith('video/webm') ? 'webm' : 'mp4';
            
            const blob = new Blob(recordedChunksRef.current, { type: mimeType || 'video/webm' });
            const url = URL.createObjectURL(blob);
            
            // Create download link
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `recording-${new Date().toISOString()}.${fileType}`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }, 100);
          };
          
          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.start(5);
          console.log("Recording started");
        } else {
          throw new Error("Video element not available");
        }
      } catch (error) {
        console.error('Error starting recording:', error);
        alert('Recording failed to start. Please try again or use a different browser.');
        return; 
      }
    }
    
    setIsRecording(!isRecording);
  };
  
  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Update fullscreen state based on fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle seeking in the video
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };
  
  // Update time and duration from video
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  // Connect CamScreen to videoRef
  const handleVideoRef = (ref: HTMLVideoElement | null) => {
    videoRef.current = ref;
  };
  
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-2">
      <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-purple-600 mb-4 sketch-text" 
          style={{ transform: 'rotate(-1deg)' }}>
        Flair
      </h1>
      
      <div ref={containerRef} 
           className="relative w-full max-w-md aspect-video mx-auto rounded-lg overflow-hidden shadow-xl"
           style={{ 
             boxShadow: '5px 5px 0 rgba(0,0,0,0.2), 0 0 20px rgba(0,0,0,0.1)',
             transform: 'rotate(0.5deg)'
           }}>
        <CamScreen 
          isPlaying={isPlaying}
          isMuted={isMuted}
          onVideoRef={handleVideoRef}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
        />
        <VideoControls 
          isPlaying={isPlaying}
          isMuted={isMuted}
          isRecording={isRecording}
          isFullscreen={isFullscreen}
          onPlayPause={handlePlayPause}
          onMuteToggle={handleMuteToggle}
          onRecordToggle={handleRecordToggle}
          onFullscreenToggle={handleFullscreenToggle}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />
      </div>
    </main>
  );
}

export default Home;