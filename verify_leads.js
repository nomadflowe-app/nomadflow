import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkLeads() {
    console.log('Fetching 10 most recent leads...');
    const { data, error } = await supabase
        .from('quiz_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

    if (error) {
        fs.writeFileSync('result_check.json', JSON.stringify({ error: error.message }, null, 2))
        return
    }

    fs.writeFileSync('result_check.json', JSON.stringify(data, null, 2))
    console.log('Done. Results in result_check.json');
}

checkLeads()
