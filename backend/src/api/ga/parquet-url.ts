/**
 * Parquetファイルの署名付きURLを返すAPIエンドポイント
 *
 * 概要:
 * - POSTで日付範囲（startDate, endDate）を受け取る
 * - Cloudflare R2上のParquetファイルの署名付きURLを生成して返却する
 *
 * 再生成プロンプト:
 * 「Cloudflare Workersで、日付範囲を受け取ってR2上のParquetファイルの署名付きURLを返すAPIエンドポイントを作成してください。POSTリクエストでstartDateとendDateを受け取り、バリデーションし、署名付きURLを返却してください。」
 */

export async function handleParquetUrlRequest(request: Request, env: any): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { startDate, endDate } = body;
  if (!startDate || !endDate) {
    return new Response(JSON.stringify({ error: 'startDate and endDate are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const bucketName = env.R2_BUCKET_NAME;
  if (!bucketName) {
    return new Response(JSON.stringify({ error: 'R2_BUCKET_NAME is not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!env.R2) {
    return new Response(JSON.stringify({ error: 'R2 binding is not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ファイル名生成
  const fileName = `ga_data_${startDate}_${endDate}.parquet`;


  // 署名付きURL生成（10分=600秒）
  try {
    const object = await env.R2.get(fileName);
    if (!object) {
      return new Response(JSON.stringify({ error: 'File not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const url = await env.R2.createPresignedUrl(fileName, 600);
    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Failed to generate signed URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
