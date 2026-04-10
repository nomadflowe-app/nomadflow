import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfiles() {
    console.log('--- Profiles Check ---');
    const { data, error } = await supabase.from('profiles').select('email, is_admin, user_id');
    if (error) {
        console.log(`❌ Error fetching profiles: ${error.message}`);
    } else {
        console.log(`Found ${data.length} profiles:`);
        data.forEach(p => {
            console.log(`- ${p.email}: is_admin=${p.is_admin} (user_id=${p.user_id})`);
        });
    }
}

checkProfiles();
