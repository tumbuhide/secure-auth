import { NextResponse } from 'next/server'
import { getPublicKey, getKeyId } from '@/lib/keys'
import * as jose from 'jose'

// In-memory cache untuk JWKS
let jwksCache: { jwks: string, timestamp: number } | null = null;
const CACHE_DURATION_SECONDS = 3600; // Cache selama 1 jam

export async function GET() {
  const now = Date.now();

  // Jika cache ada dan masih valid, kembalikan data dari cache
  if (jwksCache && (now - jwksCache.timestamp) < CACHE_DURATION_SECONDS * 1000) {
    return new NextResponse(jwksCache.jwks, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${CACHE_DURATION_SECONDS}, must-revalidate`,
      },
    });
  }

  try {
    const publicKeyPem = getPublicKey();
    const kid = getKeyId();
    const jwk = await jose.exportJWK(await jose.importSPKI(publicKeyPem, 'RS256'));

    const jwksData = {
      keys: [{ ...jwk, kid: kid, alg: 'RS256', use: 'sig' }],
    };
    
    const jwksString = JSON.stringify(jwksData);
    
    // Simpan data dan timestamp ke cache
    jwksCache = { jwks: jwksString, timestamp: now };

    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${CACHE_DURATION_SECONDS}, must-revalidate`,
    };

    return new NextResponse(jwksString, { status: 200, headers });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'server_error', error_description: 'Gagal menghasilkan atau memuat kunci server.' },
      { status: 500 }
    );
  }
}
