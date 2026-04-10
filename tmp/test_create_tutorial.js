import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCreateTutorial() {
    const dataToInsert = {
        title: "Test",
        instructor: "Test",
        duration: "10 min",
        thumbnail: "url",
        youtube_id: "123",
        is_dripped: false
    };

    console.log('--- Testing createTutorial ---');
    const { data, error } = await supabase
        .from('tutorials')
        .insert([dataToInsert])
        .select()
        .single();

    if (error) {
        console.log(`❌ Error JSON:`, JSON.stringify(error, null, 2));
        const isSchemaError = error.code === '42P01' || error.code === '42703' || error.message?.includes('Could not find');
        console.log(`isSchemaError flag would be:`, isSchemaError);
    } else {
        console.log(`✅ Success:`, data);
    }
}

testCreateTutorial();
