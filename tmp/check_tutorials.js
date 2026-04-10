import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTutorials() {
    console.log('--- Fetching Tutorials ---');
    const { data, error } = await supabase.from('tutorials').select('id, title, youtube_id');
    if (error) {
        console.log(`❌ Error fetching tutorials: ${error.message}`);
    } else {
        console.log(`Found ${data?.length} tutorials:`);
        data?.forEach(t => {
            console.log(`- Title: ${t.title} | ID: ${t.youtube_id}`);
        });
    }
}

checkTutorials();
