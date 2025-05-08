/**
 * JSONL.GZファイルをParquetに変換して署名付きURLを返すAPIエンドポイント
 *
 * 概要:
 * - POSTで日付範囲（startDate, endDate）を受け取る
 * - 指定された期間のJSONL.GZファイルをDuckDBで読み込み、Parquetに変換
 * - 変換したParquetファイルの署名付きURLを生成して返却する
 *
 * 再生成プロンプト:
 * 「Cloudflare WorkersでDuckDBを使い、日付範囲内のJSONL.GZファイルを集約してParquetに変換し、
 * R2に保存して署名付きURLを返すAPIエンドポイントを作成してください。」
 */

import * as duckdb from 'duckdb';

// 日付の範囲内の全ての日付を生成する関数
function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

// 日付からJSONL.GZファイル名を生成する関数
function getJsonlGzFileName(date: string): string {
  return date.replace(/-/g, '') + '.jsonl.gz';
}

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

  // 日付のバリデーション
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }
    if (start > end) {
      throw new Error('startDate must be before or equal to endDate');
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Invalid date format' }), {
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

  // 日付範囲内の全ての日付を取得
  const dates = getDatesInRange(startDate, endDate);

  // 各日付のJSONL.GZファイルの存在確認
  const fileChecks = await Promise.all(
    dates.map(async (date) => {
      const fileName = getJsonlGzFileName(date);
      const object = await env.R2.head(fileName);
      return {
        date,
        fileName,
        exists: object !== null,
      };
    })
  );

  // 存在しないファイルがある場合はエラー
  const missingFiles = fileChecks.filter(file => !file.exists);
  if (missingFiles.length > 0) {
    return new Response(JSON.stringify({
      error: 'Some files are missing',
      missingDates: missingFiles.map(f => f.date),
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 集約したParquetファイル名
  const aggregatedFileName = `ga_data_${startDate}_${endDate}.parquet`;

  try {
    // 既に集約ファイルが存在するかチェック
    const existingAggregated = await env.R2.head(aggregatedFileName);

    if (!existingAggregated) {
      // DuckDBデータベースを作成
      const db = new duckdb.Database(':memory:');
      const conn = await db.connect();

      // R2のクレデンシャルを設定
      await conn.all(`
        INSTALL httpfs;
        LOAD httpfs;
        SET s3_region='auto';
        SET s3_endpoint='${env.R2_ENDPOINT}';
        SET s3_access_key_id='${env.R2_ACCESS_KEY_ID}';
        SET s3_secret_access_key='${env.R2_SECRET_ACCESS_KEY}';
      `);

      // JSONL.GZファイルを読み込んでParquetに変換
      const fileList = fileChecks.map(f => `'s3://${env.R2_BUCKET_NAME}/${f.fileName}'`).join(',');
      await conn.all(`
        COPY (
          SELECT * FROM read_json_auto([${fileList}])
        ) TO 's3://${env.R2_BUCKET_NAME}/${aggregatedFileName}' (FORMAT PARQUET);
      `);

      // 接続を閉じる
      await conn.close();
      db.close();
    }

    // 署名付きURL生成（10分=600秒）
    const url = await env.R2.createPresignedUrl(aggregatedFileName, 600);
    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Failed to process files' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
