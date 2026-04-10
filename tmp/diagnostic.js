import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
    const tables = [
        'profiles',
        'checklists',
        'guides',
        'tutorials',
        'community_posts',
        'community_comments',
        'partners',
        'notifications',
        'post_likes',
        'quiz_leads'
    ];

    console.log('--- Database Diagnostic ---');
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`❌ Table ${table}: Error ${error.code} - ${error.message}`);
        } else {
            console.log(`✅ Table ${table}: Success (Row count: ${data?.length || 0})`);
            if (table === 'profiles') {
                const { data: cols, error: colErr } = await supabase.from(table).select('*').limit(0);
                // We can't easily get column names from JS client without a specific query, 
                // but checking for one we suspect might be missing:
                const { error: adminErr } = await supabase.from(table).select('is_admin').limit(1);
                if (adminErr) console.log(`   ❌ Column is_admin missing!`);
                else console.log(`   ✅ Column is_admin exists`);
            }
        }
    }
}

checkTables();
