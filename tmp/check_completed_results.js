import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCompletedResults() {
    console.log('Checking completed leads results...');

    const { data: completedLeads, error } = await supabase
        .from('quiz_leads')
        .select('result')
        .eq('status', 'completed');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    const resultDist = completedLeads.reduce((acc, lead) => {
        const res = lead.result || 'NULL';
        acc[res] = (acc[res] || 0) + 1;
        return acc;
    }, {});

    console.log('Total Completed Leads:', completedLeads.length);
    console.log('Result Distribution for Completed Leads:', resultDist);
}

checkCompletedResults()
