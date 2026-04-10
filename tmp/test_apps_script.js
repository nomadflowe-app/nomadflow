async function testAppsScript() {
    const url = 'https://script.google.com/macros/s/AKfycbxMy7zj92KasumrVa-X_J5piKy_WktVW-O9pjAcPZ0oDNJj_lyraopCwlmpKDYsqw4fyg/exec';
    const payload = {
        summary: 'TESTE FINAL NOMADFLOW',
        description: 'Teste de integração via Apps Script',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
        guestEmail: 'nomadflow.es@gmail.com'
    };

    console.log('Testando Webhook do Apps Script...');
    try {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log('Resposta do Google:', JSON.stringify(data, null, 2));
        if (data.success) {
            console.log('SUCESSO! O link do Meet é:', data.meetLink);
        } else {
            console.error('ERRO:', data.error);
        }
    } catch (e) {
        console.error('Falha na requisição:', e.message);
    }
}

testAppsScript();
