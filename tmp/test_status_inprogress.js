import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testStatusProgressUpdate() {
    const id = '49768e5d-ba1b-4358-ab0e-0b535a08a3d8';
    console.log(`Testing status update to inprogress for lead ${id}...`);

    const { data, error } = await supabase
        .from('quiz_leads')
        .update({
            status: 'inprogress'
        })
        .eq('id', id)
        .select();

    if (error) {
        console.error('Update FAILED:', error.message);
        console.error('Error Code:', error.code);
    } else {
        console.log('Update SUCCESSFUL!', data);
    }
}

testStatusProgressUpdate()
