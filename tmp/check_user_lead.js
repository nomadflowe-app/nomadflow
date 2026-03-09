import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSpecificLead() {
    const email = 'andrewalbuquerque24@gmail.com';
    console.log(`Checking lead for ${email}...`);

    const { data, error } = await supabase
        .from('quiz_leads')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log('Found leads:', data.length);
        data.forEach((lead, index) => {
            console.log(`Lead ${index + 1}:`);
            console.log('  ID:', lead.id);
            console.log('  Status:', lead.status);
            console.log('  Result:', lead.result);
            console.log('  Created At:', lead.created_at);
            console.log('  Answers:', lead.answers ? 'Present' : 'Missing');
        });
    } else {
        console.log('No leads found for this email.');
    }
}

checkSpecificLead()
