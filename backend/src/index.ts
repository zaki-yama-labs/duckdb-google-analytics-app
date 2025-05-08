/**
 * このファイルの概要:
 * - Google Cloud Functionsのメインエントリーポイント
 * - GA4データをParquet形式に変換し、Cloud Storageに保存するエンドポイントを提供
 *
 * 再生成プロンプト:
 * 「Google Cloud FunctionsのメインエントリーポイントファイルとParquet変換エンドポイントを作成してください。」
 */

import { HttpFunction } from '@google-cloud/functions-framework';
import { handleParquetUrlRequest } from './api/ga/parquet-url';

export const gaDataFunction: HttpFunction = async (req, res) => {
  try {
    if (req.path === '/api/ga/parquet-url') {
      await handleParquetUrlRequest(req, res);
      return;
    }

    res.status(404).json({ error: 'Not Found' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
