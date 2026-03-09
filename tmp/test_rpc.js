import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testRPC() {
    const leadId = '49768e5d-ba1b-4358-ab0e-0b535a08a3d8';
    console.log(`Testing complete_quiz_lead_v3 for lead ${leadId}...`);

    const { data, error } = await supabase.rpc('complete_quiz_lead_v3', {
        p_lead_id: leadId,
        p_result: 'A',
        p_score: 100,
        p_answers: [{ id: 'test', value: 'test', points: 10 }]
    });

    if (error) {
        console.error('RPC FAILED:', error.message);
        console.error('Error Stack:', error.stack);
        console.error('Error Code:', error.code);
    } else {
        console.log('RPC SUCCESSFUL!', data);
    }
}

testRPC()
