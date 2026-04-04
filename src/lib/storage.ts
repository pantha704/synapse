import { createClient } from '@/utils/supabase/client';

export async function uploadResourceFile(file: File, prefix: string = '') {
  const supabase = createClient();
  
  // Create a unique filepath
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = prefix ? `${prefix}/${fileName}` : fileName;

  const { data, error } = await supabase.storage
    .from('resources')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from('resources')
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: publicUrlData.publicUrl,
  };
}
