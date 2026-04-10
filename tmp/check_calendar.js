import crypto from 'crypto';

const GOOGLE_SA = {
  "client_email": "nomadflowagenda@diesel-script-492521-g8.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDXUsf+1Q13cJG1\nQWtMR6eRnA1wLC52zdo11F4lj2Z7FKZHw+lHzm2klC7JZrBsNS2leevQHvkoLd0m\npOTxDYeBw2y/WH2eHGy4js4f/L9Jfv7w3Jtn66wjcYPUtH+xag2X3kRHZmqrPkj1\noQgHmp1bXUqhL2p9SegrEkBFjRiNv/q9FzjKgHZVJQq/kVBZfdPPP4uriTYYcMUQ\nF9Ql8r7d62oRVsuwBpCZRDxzwBanwnXSnfZy2ZCP6nEl5GGrkS9cbg+IjDRpe/75\n7H0cUurjCfAwJVu3r/8EuKOqVFKG5YnfsesmBW5BQaPZESErIo3TlW1WzQVou83g\nkONXveBzAgMBAAECggEAA2/ssF/fSKj73SGvtaEuhsUFHpAd/RiDzg3XTjsv9BwG\nxtN/naf+bmeifZA4QGny52wppwIE5oQg6R/YZb6vtehpi9O89vFWN6CpSq/Cr/N+\nh1gbhPj+n6GNbK+lmtk/YU1o1/ObFU5iZMVkIZbxbHFx97O65p1vlCxvk+H7jTEG\nq+muiLCBMk1KmxRJnx1Z77yRjyUpXSCD20VuttvjwY6JyXt1s8f3DPvLPdk0Fhzj\nctNZgt/rpz7Fiu0NZEfR306rWv3ghu4fuG1FqXzwO7AsSsl10nwsaSi/b+epADPR\njWSMTDnsyQ6dtxolwM/bwynlCYOLvUnFm5QOchYVpQKBgQD6Y5DG4gjVGxbYCZHD\nFgZlKYDz14Sm7OCRkb/M9ADglMYI1whs6a5Un8iR2pxfiggFTejEbLLe3tA5I9tK\nPnY1DSyJxmnt7VhGCpPAAYM1mDf3sr5tGZlC7BjDOxaoO65erVyYvBR23JhTUiSF\n7GpYDsoY1YYpFRdNoHLHGvi3FQKBgQDcJg0V2YfuMT/F4/zaCufxNzgY5b7bh0Zi\n78ZFMl4z53AC+KpVVedN5CZ+19ZyJ6UYNbfYcttRmvmkxVNxuL+VqjGTtTB2qDCd\nMIVgDdFJD9Q39ZItUM32DNcInCksjNcPflRrOY7Wcbx/dOP+48j+qhVNt2raAHtL\RKUuMCkbZwKBgHIBg5oKsRrXCr+zG7tH/AFztFNSfgPDNz0Qr9QSBZQ8KS89OYjd\nnZLKbfh7IVge8Sf5IVLOa2Mu8IAT43Uam5fsN6tDvFepCdhaWIvEJInylQkjSbFD\nRpVCCsRZ0ycmhW52YQLqICc+qdzGOfsAeis+EKbeEggComml9JzTmwtBAoGAWT7z\nvw/Yky9T8x1hu+L/9EG2dCFvJf/JAQLDFfo9Rj1ko0+7fay9gE4lbPaC8PQxcYcV\naKHnV0XEPo/gLBIBWOMOBhtF8lRsoMyyxSXU2hGYrrbW85f2ZvD9m3fzGSRfauCD\nyJQk27pv+Bui8gnVyaeZy0+3+XiIgxLpA7hycbECgYB7wUlwvGf3n9ITla71GL9a\nvCqpFt4kXhJTgnCS5BhCdJfxVdueA/LR3Doo9cP8g6PtxWE2tCld6fLLhixAiM/T\nebtZjV3bxQSjSzePY0wznJCmNcnz8DXPe0ZC2o0gTm583VnMWZeBCDWnrurlNkjB\nGq6b+u1xs7cmGysp3IZmrQ==\n-----END PRIVATE KEY-----\n"
};

const TARGET_EMAIL = 'nomadflow.es@gmail.com';

function createJwt(email, key) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const payload = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events', // Ampliando o escopo
    aud: 'https://oauth2.googleapis.com/token',
    exp: iat + 3600,
    iat
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = signer.sign(key, 'base64url');
  
  return `${signatureInput}.${signature}`;
}

async function checkCalendar() {
    console.log(`--- VERIFICANDO METADADOS DA AGENDA: ${TARGET_EMAIL} ---`);
    try {
        const jwt = createJwt(GOOGLE_SA.client_email, GOOGLE_SA.private_key);
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
        });

        const { access_token } = await tokenRes.json();

        // Buscar detalhes da agenda
        const calRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(TARGET_EMAIL)}`, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });

        const calData = await calRes.json();
        console.log('Metadados da Agenda:', JSON.stringify(calData, null, 2));

        if (calData.conferenceProperties) {
          console.log('Soluções de Conferência Permitidas:', calData.conferenceProperties.allowedConferenceSolutionTypes);
        } else {
          console.log('AVISO: A agenda não parece suportar conferências ou a Conta de Serviço não tem permissão para ver essas propriedades.');
        }

    } catch (error) {
        console.error('Erro:', error.message);
    }
}

checkCalendar();
