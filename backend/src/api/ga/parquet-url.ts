/**
 * JSONL.GZファイルをParquetに変換して署名付きURLを返すAPIエンドポイント
 *
 * 概要:
 * - POSTで日付範囲（startDate, endDate）を受け取る
 * - 指定された期間のJSONL.GZファイルをDuckDBで読み込み、Parquetに変換
 * - 変換したParquetファイルの署名付きURLを生成して返却する
 *
 * 再生成プロンプト:
 * 「Google Cloud FunctionsでDuckDBを使い、日付範囲内のJSONL.GZファイルを集約してParquetに変換し、
 * Cloud Storageに保存して署名付きURLを返すAPIエンドポイントを作成してください。」
 */

import { Storage } from '@google-cloud/storage';
import * as duckdb from 'duckdb';

const storage = new Storage();
const bucketName = process.env.BUCKET_NAME;
if (!bucketName) {
  throw new Error('BUCKET_NAME environment variable is not set');
}

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

export async function handleParquetUrlRequest(req: any, res: any): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { startDate, endDate } = req.body;
  if (!startDate || !endDate) {
    res.status(400).json({ error: 'startDate and endDate are required' });
    return;
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
    res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid date format' });
    return;
  }

  // 日付範囲内の全ての日付を取得
  const dates = getDatesInRange(startDate, endDate);

  // 各日付のJSONL.GZファイルの存在確認
  const bucket = storage.bucket(bucketName);
  const fileChecks = await Promise.all(
    dates.map(async (date) => {
      const fileName = getJsonlGzFileName(date);
      const [exists] = await bucket.file(fileName).exists();
      return {
        date,
        fileName,
        exists,
      };
    })
  );

  // 存在しないファイルがある場合はエラー
  const missingFiles = fileChecks.filter(file => !file.exists);
  if (missingFiles.length > 0) {
    res.status(404).json({
      error: 'Some files are missing',
      missingDates: missingFiles.map(f => f.date),
    });
    return;
  }

  // 集約したParquetファイル名
  const aggregatedFileName = `ga_data_${startDate}_${endDate}.parquet`;

  try {
    // 既に集約ファイルが存在するかチェック
    const [exists] = await bucket.file(aggregatedFileName).exists();

    if (!exists) {
      // DuckDBデータベースを作成
      const db = new duckdb.Database(':memory:');
      const conn = await db.connect();

      // Cloud Storageのクレデンシャルは自動的に設定される（サービスアカウントを使用）
      await conn.all(`
        INSTALL httpfs;
        LOAD httpfs;
      `);

      // JSONL.GZファイルを読み込んでParquetに変換
      const fileList = fileChecks.map(f => `'gs://${bucketName}/${f.fileName}'`).join(',');
      await conn.all(`
        COPY (
          SELECT * FROM read_json_auto([${fileList}])
        ) TO 'gs://${bucketName}/${aggregatedFileName}' (FORMAT PARQUET);
      `);

      // 接続を閉じる
      await conn.close();
      db.close();
    }

    // 署名付きURL生成（10分=600秒）
    const [url] = await bucket.file(aggregatedFileName).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 10 * 60 * 1000, // 10分
    });

    res.status(200).json({ url });
  } catch (e) {
    console.error('Error:', e);
    res.status(500).json({ error: e instanceof Error ? e.message : 'Failed to process files' });
  }
}
