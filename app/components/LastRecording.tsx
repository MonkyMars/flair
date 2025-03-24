import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { FaPlayCircle } from 'react-icons/fa';

interface LastRecordingProps {
  onClickPreview: (url: string) => void;
  bucketName?: string;
}

const LastRecording = ({ 
  onClickPreview,
  bucketName = 'videos'
}: LastRecordingProps) => {
  const [lastRecordingUrl, setLastRecordingUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the most recent recording
  useEffect(() => {
    const fetchLastRecording = async () => {
      try {
        setLoading(true);
        
        // List all files in the videos bucket, sorted by created_at
        const { data, error } = await supabase
          .storage
          .from(bucketName)
          .list('');
        
        if (error) {
          console.error('Error listing files:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          // Sort by creation time (just to be sure)
          const sortedFiles = [...data].sort((a, b) => {
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          });
          
          const latestFile = sortedFiles[0];
        
          // Get the public URL for the most recent file
          const { data: publicUrlData } = supabase
            .storage
            .from(bucketName)
            .getPublicUrl(latestFile.name);
          
          setLastRecordingUrl(publicUrlData.publicUrl);
          
          // For selfies, just use the image directly
          if (bucketName === 'selfies') {
            setThumbnailUrl(publicUrlData.publicUrl);
          } else {
            // For videos, use a base64 placeholder
            setThumbnailUrl('placeholder.jpg');
          }
        } else {
          console.log('No files found in bucket');
        }
      } catch (err) {
        console.error('Error fetching last recording:', err);
        setError('Could not load previous recording');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLastRecording();
    
    // Set up a listener to refresh when new recordings are added
    const interval = setInterval(() => {
      fetchLastRecording();
    }, 5000); // Check every 5 seconds for new recordings
    
    return () => {
      clearInterval(interval);
    };
  }, [bucketName]);
  
  if (loading || error || !lastRecordingUrl) {
    // Instead of returning null, show an empty preview box with a clear indicator
    return (
      <div 
        className="last-recording opacity-70 flex items-center justify-center bg-gray-900"
        role="button"
        aria-label="No recordings yet"
      >
        <span className="text-sm text-white font-bold">No recordings</span>
      </div>
    );
  }
  
  return (
    <div 
      className="last-recording" 
      onClick={() => onClickPreview(lastRecordingUrl)}
      role="button"
      aria-label="View last recording"
    >
      {/* If it's a video, we use a thumbnail approach */}
      <div className="relative w-full h-full">
        {bucketName === 'selfies' ? (
          <Image 
            src={thumbnailUrl || '/placeholder.jpg'}
            alt="Last selfie"
            fill
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
              <FaPlayCircle className="text-white text-opacity-90" size={24} />
            </div>
            {/* Show either our generated thumbnail or a fallback */}
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              {thumbnailUrl ? (
                <Image 
                  src={thumbnailUrl}
                  alt="Video thumbnail"
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
              ) : (
                <span className="text-xs text-white">Last Video</span>
              )}
            </div>
          </>
        )}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default LastRecording; 