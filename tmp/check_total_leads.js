import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTotalLeads() {
    console.log('Checking total leads count...');
    const { count, error } = await supabase
        .from('quiz_leads')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error fetching count:', error.message);
        return;
    }

    console.log('Total Leads Count:', count);
}

checkTotalLeads()
