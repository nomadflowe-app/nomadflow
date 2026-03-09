import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkLeads() {
    console.log('Fetching 5 most recent leads...');
    const { data, error } = await supabase
        .from('quiz_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

    if (error) {
        console.error('Error fetching leads:', error)
        return
    }

    if (data && data.length > 0) {
        data.forEach((lead, i) => {
            console.log(`\n--- Lead ${i + 1}: ${lead.name} (${lead.email}) ---`);
            console.log(`Status: ${lead.status}`);
            console.log(`Result: ${lead.result}`);
            console.log(`Has Answers: ${Array.isArray(lead.answers) && lead.answers.length > 0 ? 'Yes (' + lead.answers.length + ' questions)' : 'No'}`);
            console.log(`Salary Column: ${lead.salary || 'empty'}`);
            console.log(`Remote Work: ${lead.remote_work || 'empty'}`);
            console.log(`Created At: ${lead.created_at}`);
            console.log(`Updated At: ${lead.updated_at || 'missing'}`);
        });
    } else {
        console.log('No leads found.');
    }
}

checkLeads()
