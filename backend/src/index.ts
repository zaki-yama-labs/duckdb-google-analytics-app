/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { SignJWT } from 'jose';
import { importPKCS8 } from 'jose';

interface ServiceAccountKey {
  private_key: string;
  client_email: string;
  token_uri: string;
}

async function getAccessToken(serviceAccountJson: string): Promise<string> {
  const keyJson: ServiceAccountKey = JSON.parse(serviceAccountJson);
  const alg = 'RS256';
  const key = await importPKCS8(keyJson.private_key, alg);
  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({
    iss: keyJson.client_email,
    sub: keyJson.client_email,
    aud: keyJson.token_uri,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    iat: now,
    exp: now + 3600,
  })
    .setProtectedHeader({ alg })
    .sign(key);

  const tokenResponse = await fetch(keyJson.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text();
    throw new Error(`Token fetch failed: ${err}`);
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string };
  return tokenData.access_token;
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/ga') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const saJson = env.SERVICE_ACCOUNT_JSON;
      const propertyId = env.GA4_PROPERTY_ID;
      if (!saJson || !propertyId) {
        return new Response(JSON.stringify({ error: 'Configuration error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      let requestBody: unknown;
      try {
        requestBody = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      let accessToken: string;
      try {
        accessToken = await getAccessToken(saJson);
      } catch (e) {
        return new Response(
          JSON.stringify({
            error: e instanceof Error ? e.message : 'Failed to obtain access token',
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const gaUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
      let gaResponse: Response;
      // Transform incoming request parameters to the GA4 Data API v1beta schema
      const { startDate, endDate, metrics, dimensions } = requestBody as any;
      const gaRequestBody = {
        dateRanges: [{ startDate, endDate }],
        metrics: Array.isArray(metrics) ? metrics.map((m: any) => ({ name: m })) : [],
        dimensions: Array.isArray(dimensions) ? dimensions.map((d: any) => ({ name: d })) : [],
      };
      try {
        gaResponse = await fetch(gaUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gaRequestBody),
        });
      } catch {
        return new Response(JSON.stringify({ error: 'Failed to fetch GA data' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const responseText = await gaResponse.text();
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      return new Response(responseText, { status: gaResponse.status, headers });
    }

    if (url.pathname === '/') {
      return new Response('Hello World!');
    }

    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
