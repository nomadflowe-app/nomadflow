import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnostic() {
    console.log('Running diagnostics on quiz_leads...');

    // 1. Total Count
    const { count: total, error: e1 } = await supabase.from('quiz_leads').select('*', { count: 'exact', head: true });

    // 2. Status Distribution
    const { data: statusDist, error: e2 } = await supabase.rpc('get_status_dist'); // Let's try direct query if RPC fails
    const { count: completedCount } = await supabase.from('quiz_leads').select('*', { count: 'exact', head: true }).eq('status', 'completed');
    const { count: startedCount } = await supabase.from('quiz_leads').select('*', { count: 'exact', head: true }).eq('status', 'started');

    // 3. Check for duplicates (emails)
    const { data: leads, error: e3 } = await supabase.from('quiz_leads').select('email');
    const emailCounts = {};
    leads?.forEach(l => {
        if (l.email) emailCounts[l.email] = (emailCounts[l.email] || 0) + 1;
    });
    const duplicates = Object.entries(emailCounts).filter(([email, count]) => count > 1);

    console.log('Total:', total);
    console.log('Completed:', completedCount);
    console.log('Started:', startedCount);
    console.log('Emails with duplicates:', duplicates.length);
    if (duplicates.length > 0) {
        console.log('Top duplicates:', duplicates.sort((a, b) => b[1] - a[1]).slice(0, 5));
    }
}

diagnostic()
