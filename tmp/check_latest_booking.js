// Usando anon key para verificar os últimos agendamentos
const SUPABASE_URL = 'https://zskjfjrxgmsapfqibmia.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2pmanJ4Z21zYXBmcWlibWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzI4MjUsImV4cCI6MjA1OTAwODgyNX0.zmzy295eIQ37TFFSEOtv7OnxABIH-SWHLlho3OegJn8b24i';

async function checkBookings() {
  console.log('--- Verificando últimos agendamentos ---\n');

  const res = await fetch(`${SUPABASE_URL}/rest/v1/consultation_bookings?select=id,name,email,payment_status,payment_id,meet_link,calendar_event_id,created_at&order=created_at.desc&limit=5`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('Erro:', JSON.stringify(data));
    return;
  }

  if (!data?.length) {
    console.log('Nenhum agendamento encontrado (pode ser problema de RLS).');
    return;
  }

  data.forEach((b, i) => {
    console.log(`[${i+1}] ${b.name} <${b.email}>`);
    console.log(`    Status:         ${b.payment_status}`);
    console.log(`    Payment ID:     ${b.payment_id ?? '(vazio)'}`);
    console.log(`    Meet Link:      ${b.meet_link ?? '⚠️ não gerado ainda'}`);
    console.log(`    Calendar Event: ${b.calendar_event_id ?? '(não criado)'}`);
    console.log(`    Criado em:      ${b.created_at}`);
    console.log('');
  });
}

checkBookings();
