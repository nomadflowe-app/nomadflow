import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function fetchAllLeads() {
    console.log('Fetching all leads...');
    let allLeads = [];
    let from = 0;
    const step = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('quiz_leads')
            .select('*')
            .order('created_at', { ascending: false })
            .range(from, from + step - 1);

        if (error) {
            console.error('Error fetching leads:', error.message);
            break;
        }

        if (!data || data.length === 0) break;

        allLeads = allLeads.concat(data);
        console.log(`Fetched ${allLeads.length} leads so far...`);

        if (data.length < step) break;
        from += step;
    }

    console.log('Total Leads Fetched:', allLeads.length);

    const statusCounts = allLeads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
    }, {});

    console.log('Status Distribution:', statusCounts);

    // Check if exactly 1000 or similar number appears anywhere
    const recentLeads = allLeads.slice(0, 10);
    console.log('Recent 10 leads sample:', recentLeads.map(l => ({ id: l.id, status: l.status, result: l.result })));
}

fetchAllLeads()
