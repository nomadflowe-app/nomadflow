import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testStats() {
    console.log('Testing getQuizStats logic...');

    // Simulate getQuizStats logic
    const [allRes, compRes, aRes, bRes, cRes] = await Promise.all([
        supabase.from('quiz_leads').select('id', { count: 'exact', head: true }),
        supabase.from('quiz_leads').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('quiz_leads').select('id', { count: 'exact', head: true }).eq('result', 'A'),
        supabase.from('quiz_leads').select('id', { count: 'exact', head: true }).eq('result', 'B'),
        supabase.from('quiz_leads').select('id', { count: 'exact', head: true }).eq('result', 'C'),
    ]);

    console.log('Results:');
    console.log('Total (started):', allRes.count);
    console.log('Completed:', compRes.count);
    console.log('Result A:', aRes.count);
    console.log('Result B:', bRes.count);
    console.log('Result C:', cRes.count);
}

testStats()
