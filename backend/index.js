import { SignJWT, importPKCS8 } from 'jose';

export async function fetch(request, env) {
    console.log('hello');
    const url = new URL(request.url);
    if (url.pathname !== '/api/ga') {
      return new Response(null, { status: 404 });
    }
    if (request.method !== 'POST') {
      return new Response(null, { status: 405 });
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }
    console.log(env.SERVICE_ACCOUNT_JSON);
    console.log(env.GA4_PROPERTY_ID);
    const sa = JSON.parse(env.SERVICE_ACCOUNT_JSON);
    const propertyId = env.GA4_PROPERTY_ID;
    const now = Math.floor(Date.now() / 1000);
    let jwt;
    try {
      const privateKey = await importPKCS8(sa.private_key, 'RS256');
      jwt = await new SignJWT({
        iss: sa.client_email,
        scope: 'https://www.googleapis.com/auth/analytics.readonly',
        aud: 'https://oauth2.googleapis.com/token'
      })
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
        .setIssuedAt(now)
        .setExpirationTime(now + 3600)
        .sign(privateKey);
    } catch {
      return new Response('Error creating JWT', { status: 500 });
    }
    let tokenResponse;
    try {
      tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt
        })
      });
    } catch {
      return new Response('Error fetching access token', { status: 502 });
    }
    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      return new Response(`Token error: ${errText}`, { status: tokenResponse.status });
    }
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const reportReq = {
      dateRanges: [{ startDate: body.startDate, endDate: body.endDate }],
      metrics: Array.isArray(body.metrics)
        ? body.metrics.map(name => ({ name }))
        : [],
      dimensions: Array.isArray(body.dimensions)
        ? body.dimensions.map(name => ({ name }))
        : []
    };
    let gaResponse;
    try {
      gaResponse = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reportReq)
        }
      );
    } catch {
      return new Response('Error fetching GA4 data', { status: 502 });
    }
    const gaJson = await gaResponse.text();
    return new Response(gaJson, {
      status: gaResponse.status,
      headers: { 'Content-Type': 'application/json' }
    });
}
