"use client";

import { useState, useRef, useEffect } from "react";
import CamScreen from "./camera";
import VideoControls from "./controls";
import Banner from "./components/Banner";
import LastRecording from "./components/LastRecording";
import { sendVideo } from "@/lib/sendVideo";
import { sendSelfie } from "@/lib/sendSelfie";
import Image from "next/image";

const Home = () => {
  // Video control states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSelfieMode, setIsSelfieMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Modal/preview states
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Error handling
  const [error, setError] = useState<{message: string; visible: boolean} | null>(null);
  const [success, setSuccess] = useState<{message: string; visible: boolean} | null>(null);

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

  // Handle selfie mode toggle
  const handleSelfieToggle = () => {
    // If currently recording, prevent changing mode
    if (isRecording) {
      showError("Can't change mode while recording");
      return;
    }
    
    setIsSelfieMode(!isSelfieMode);
  };
  
  // Handle selfie capture
  const handleSelfieCapture = async () => {
    try {
      if (!videoRef.current) {
        throw new Error("Camera not available");
      }
      
      // Use the captureSelfie method we added to the video element
      const selfieBlob = await (videoRef.current as HTMLVideoElement & { 
        captureSelfie: () => Promise<Blob | null> 
      }).captureSelfie();
      
      if (!selfieBlob) {
        throw new Error("Failed to capture image");
      }
      
      // Show success message with a little delay to make the experience feel complete
      setSuccess({
        message: "Capturing selfie...",
        visible: true
      });
      
      // Upload the selfie to Supabase
      await sendSelfie(selfieBlob);
      
      // Update success message
      setTimeout(() => {
        setSuccess({
          message: "Selfie captured and saved!",
          visible: true
        });
      }, 1000);
      
    } catch (error) {
      console.error("Error capturing selfie:", error);
      showError("Failed to capture selfie. Please try again.");
    }
  };

  // Show error with auto dismiss
  const showError = (message: string) => {
    setError({ message, visible: true });
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setError(prev => prev ? { ...prev, visible: false } : null);
    }, 5000);
  };
  
  // Handle dismiss error notification
  const handleDismissError = () => {
    setError(prev => prev ? { ...prev, visible: false } : null);
  };
  
  // Handle dismiss success notification
  const handleDismissSuccess = () => {
    setSuccess(prev => prev ? { ...prev, visible: false } : null);
  };

  // Handle record toggle
  const handleRecordToggle = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        
        // Show a stopping message
        setSuccess({
          message: "Stopping recording...",
          visible: true
        });
      }
    } else {
      // Start recording
      try {
        recordedChunksRef.current = [];

        if (videoRef.current) {
          // Make sure we're getting the stream directly from the source
          const stream = videoRef.current.srcObject as MediaStream;

          // Check if the stream is active
          if (
            !stream ||
            stream.getVideoTracks().length === 0 ||
            !stream.getVideoTracks()[0].enabled
          ) {
            throw new Error("Stream is not active");
          }

          // Check for supported MIME types
          const supportedMimeTypes = [
            "video/webm;codecs=vp9",
            "video/webm;codecs=vp8",
            "video/webm",
            "video/mp4",
          ];

          let options = {};
          let mimeType = "";

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

          mediaRecorder.onstop = async () => {
            if (recordedChunksRef.current.length === 0) {
              showError("No data was recorded");
              return;
            }

            const blob = new Blob(recordedChunksRef.current, {
              type: mimeType || "video/webm",
            });

            try {
              setSuccess({
                message: "Saving your video...",
                visible: true
              });
              
              await sendVideo(blob);
              
              setTimeout(() => {
                setSuccess({
                  message: "Video saved successfully!",
                  visible: true
                });
                
                // Briefly force the LastRecording component to refresh
                // This will help ensure it fetches the newest video
                setTimeout(() => {
                  window.dispatchEvent(new Event('storage'));
                }, 1000);
              }, 1000);
            } catch (error) {
              console.error("Failed to upload video:", error);
              showError("Failed to upload video. Please check your connection.");
            }
          };

          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.start(5);
          console.log("Recording started");
          
          // Show a starting message
          setSuccess({
            message: "Recording started",
            visible: true
          });
        } else {
          throw new Error("Video element not available");
        }
      } catch (error) {
        console.error("Error starting recording:", error);
        showError("Recording failed to start. Please try again or use a different browser.");
        return;
      }
    }

    setIsRecording(!isRecording);
  };

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
        showError("Couldn't enter fullscreen mode");
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

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Update time from video
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleDurationChange = () => {
    // Just keep this function for reference but we don't need to set duration anymore
  };

  // Connect CamScreen to videoRef
  const handleVideoRef = (ref: HTMLVideoElement | null) => {
    videoRef.current = ref;
  };
  
  // Handle camera errors with more details
  const handleCameraError = (message: string) => {
    console.error("Camera error:", message);
    showError(`Camera error: ${message}. Please check permissions and try again.`);
  };
  
  // Handle preview click
  const handlePreviewClick = (url: string) => {
    setPreviewUrl(url);
  };
  
  // Close preview
  const closePreview = () => {
    setPreviewUrl(null);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-2 relative" style={{ backgroundColor: "#121212" }}>
      {/* Error and success banners */}
      {error && (
        <Banner 
          message={error.message}
          type="error"
          visible={error.visible}
          onClose={handleDismissError}
        />
      )}
      
      {success && (
        <Banner 
          message={success.message}
          type="success"
          visible={success.visible}
          onClose={handleDismissSuccess}
        />
      )}
    
      <div className="w-full max-w-md mx-auto mt-2 mb-4">
        <h1
          className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A5F] to-[#6C63FF] mb-2 sketch-text text-center app-title"
          style={{ transform: "rotate(-1deg)" }}
        >
          Flair
        </h1>
        
        <p className="text-center text-gray-300 mb-4 max-w-xs mx-auto">
          Capture moments with personality
        </p>

        <div
          ref={containerRef}
          className="relative w-full max-w-sm mx-auto aspect-[3/4] rounded-lg overflow-hidden shadow-xl border border-[#FF5A5F]"
          style={{
            boxShadow: "5px 5px 0 rgba(255,90,95,0.3), 0 0 20px rgba(0,0,0,0.3)",
            transform: "rotate(0.5deg)",
          }}
        >
          <CamScreen
            isPlaying={isPlaying}
            isMuted={isMuted}
            isSelfieMode={isSelfieMode}
            onVideoRef={handleVideoRef}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onError={handleCameraError}
          />
          <VideoControls
            isPlaying={isPlaying}
            isMuted={isMuted}
            isRecording={isRecording}
            isFullscreen={isFullscreen}
            isSelfieMode={isSelfieMode}
            onPlayPause={handlePlayPause}
            onMuteToggle={handleMuteToggle}
            onRecordToggle={handleRecordToggle}
            onFullscreenToggle={handleFullscreenToggle}
            onSelfieCapture={handleSelfieCapture}
            onToggleSelfieMode={handleSelfieToggle}
            currentTime={currentTime}
          />
        </div>
      </div>
      
      {/* Last recording preview */}
      <LastRecording 
        onClickPreview={handlePreviewClick}
        bucketName={isSelfieMode ? 'selfies' : 'videos'}
      />
      
      {/* Preview modal */}
      {previewUrl && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div 
            className="max-w-3xl w-full max-h-screen rounded-lg overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-2 z-10"
              onClick={closePreview}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {previewUrl.includes('selfie') ? (
              <div className="relative w-full h-[80vh]">
                <Image
                  src={previewUrl}
                  alt="Selfie preview"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            ) : (
              <video 
                src={previewUrl} 
                controls 
                className="w-full h-auto max-h-[80vh]" 
                autoPlay
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
