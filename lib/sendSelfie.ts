import { supabase } from './supabase';

export const sendSelfie = async (image: Blob) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `selfie-${timestamp}.jpg`;
        
        const { data, error } = await supabase
            .storage
            .from('selfies')
            .upload(fileName, image, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'image/jpeg'
            });
        
        if (error) {
            console.error("Error uploading selfie:", error);
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error('Error in sendSelfie:', error);
        throw error;
    }
}; 