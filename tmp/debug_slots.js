
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://zskjfjrxgmsapfqibmia.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDQzNzQsImV4cCI6MjA4Mjg4MDM3NH0.Jmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSlots() {
  console.log('Fetching slots...');
  const { data: slots, error } = await supabase
    .from('consultation_slots')
    .select('*, consultation_bookings(id, payment_status, created_at)')
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching slots:', error);
    return;
  }

  console.log(`Found ${slots.length} total slots.`);

  const now = new Date();
  const EXPIRATION_MS = 20 * 60 * 1000;

  const results = slots.map(slot => {
    const bookings = slot.consultation_bookings || [];
    const isPaid = bookings.some(b => b.payment_status === 'paid');
    const hasRecentPending = bookings.some(b => 
      b.payment_status === 'pending' && 
      (now.getTime() - new Date(b.created_at).getTime()) < EXPIRATION_MS
    );
    
    return {
      id: slot.id,
      start_time: slot.start_time,
      bookings_count: bookings.length,
      isPaid,
      hasRecentPending,
      visible: !isPaid && !hasRecentPending
    };
  });

  console.table(results);
  console.log('Available slots:', results.filter(r => r.visible).length);
}

debugSlots();
