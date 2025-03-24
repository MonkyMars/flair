import {supabase} from './supabase';

export const sendVideo = async (video: Blob) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `video-${timestamp}.mp4`;
        
        const { data, error } = await supabase.storage
            .from('videos')
            .upload(fileName, video, {
                cacheControl: '3600',
                upsert: false
            });
            
        if (error) {
            console.error("Error uploading video:", error);
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error("Error in sendVideo:", error);
        throw error;
    }
};