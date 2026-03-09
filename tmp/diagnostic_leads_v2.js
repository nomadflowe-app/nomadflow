import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8'
const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnosticLeads() {
    console.log('Running lead diagnostic...');

    const { data: leads, error } = await supabase
        .from('quiz_leads')
        .select('id, status, result, answers, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Analyzing last ${leads.length} leads:`);

    let startedWithAnswers = 0;
    let startedWithResult = 0;

    leads.forEach(lead => {
        const answerCount = Array.isArray(lead.answers) ? lead.answers.length : 0;
        if (lead.status === 'started') {
            if (answerCount > 10) startedWithAnswers++;
            if (lead.result) startedWithResult++;
        }
    });

    console.log(`- Started leads with > 10 answers: ${startedWithAnswers}`);
    console.log(`- Started leads with non-null results: ${startedWithResult}`);

    if (startedWithAnswers > 0) {
        console.log('\nSample of started leads with many answers:');
        leads.filter(l => l.status === 'started' && (Array.isArray(l.answers) ? l.answers.length : 0) > 10)
            .slice(0, 5)
            .forEach(l => {
                console.log(`- ID: ${l.id} | Answers: ${l.answers.length} | Created: ${l.created_at}`);
            });
    }
}

diagnosticLeads()
