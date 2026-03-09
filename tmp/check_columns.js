import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumns() {
    console.log('Checking quiz_leads columns...');
    const { data, error } = await supabase
        .from('quiz_leads')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching columns:', error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
    } else {
        console.log('No data found in quiz_leads.');
    }
}

checkColumns()
