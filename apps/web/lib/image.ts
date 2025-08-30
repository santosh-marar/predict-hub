
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const uploadImageToSupabase = async (
  file: File, 
  bucket: string = 'categories', 
  folder: string = 'images'
): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;


    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      toast.error(`Upload failed: ${error.message}`);
    }


    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;

  } catch (error: any) {
    throw error;
  }
};

export const deleteImageFromSupabase = async (
  imageUrl: string, 
  bucket: string = 'categories'
): Promise<void> => {
  try {
    const url = new URL(imageUrl);
    const pathSegments = url.pathname.split('/');
    const bucketIndex = pathSegments.findIndex(segment => segment === bucket);
    
    if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
      const filePath = pathSegments.slice(bucketIndex + 2).join('/');
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        toast.error(`Failed to delete image: ${error.message}`);
      }
    }
  } catch (error) {
  }
};