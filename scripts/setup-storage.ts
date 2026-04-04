import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function setupStorage() {
  console.log("Checking if 'resources' bucket exists...");
  const { data: buckets, error: fetchError } = await supabase.storage.listBuckets();
  
  if (fetchError) {
    console.error("Failed to list buckets:", fetchError);
    process.exit(1);
  }

  const resourcesBucketExists = buckets.some(b => b.name === 'resources');

  if (resourcesBucketExists) {
    console.log("'resources' bucket already exists. Ensuring it is public...");
    await supabase.storage.updateBucket('resources', {
      public: true,
      allowedMimeTypes: null,
      fileSizeLimit: null
    });
    console.log("Bucket 'resources' is ready.");
  } else {
    console.log("Creating 'resources' bucket...");
    const { data, error } = await supabase.storage.createBucket('resources', {
      public: true,
      allowedMimeTypes: null,
      fileSizeLimit: null
    });
    
    if (error) {
      console.error("Failed to create bucket:", error);
      process.exit(1);
    }
    console.log("Bucket 'resources' fully created and set to public.");
  }
}

setupStorage();
