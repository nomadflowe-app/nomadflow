import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSpecificLeadAnswers() {
    const id = '49768e5d-ba1b-4358-ab0e-0b535a08a3d8';
    console.log(`Checking answers for lead ID: ${id}...`);

    const { data, error } = await supabase
        .from('quiz_leads')
        .select('answers, status, result')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('Status:', data.status);
    console.log('Result:', data.result);
    console.log('Answers Count:', Array.isArray(data.answers) ? data.answers.length : 0);
    console.log('Answers:', JSON.stringify(data.answers, null, 2));
}

checkSpecificLeadAnswers()
