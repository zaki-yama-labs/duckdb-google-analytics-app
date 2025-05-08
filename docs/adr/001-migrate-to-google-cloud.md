# ADR 001: Migration from Cloudflare Workers to Google Cloud

## Status

Accepted

## Context

We initially chose Cloudflare Workers for our backend implementation, aiming to use DuckDB for data aggregation and Parquet conversion. However, we encountered a critical issue when trying to use the `duckdb` package in the Workers environment.

The specific error occurred during deployment:

```
✘ [ERROR] Build failed with 4 errors:

  ✘ [ERROR] No loader is configured for ".html" files:
  node_modules/@mapbox/node-pre-gyp/lib/util/nw-pre-gyp/index.html
  
  ✘ [ERROR] Could not resolve "mock-aws-s3"
      node_modules/@mapbox/node-pre-gyp/lib/util/s3_setup.js:67:28
  
  ✘ [ERROR] Could not resolve "aws-sdk"
      node_modules/@mapbox/node-pre-gyp/lib/util/s3_setup.js:100:22
  
  ✘ [ERROR] Could not resolve "nock"
      node_modules/@mapbox/node-pre-gyp/lib/util/s3_setup.js:136:23
```

This error occurs because:
1. DuckDB's Node.js package relies on native modules through `node-pre-gyp`
2. Cloudflare Workers runs in a V8 isolate environment, which doesn't support native Node.js modules
3. While Workers supports some Node.js APIs through the `nodejs_compat` flag, it doesn't support native modules

## Decision

After evaluating several alternatives, we decided to migrate to Google Cloud Platform:

### Considered Alternatives

1. **AWS Lambda + S3**
   - ✅ Full Node.js environment with DuckDB support
   - ✅ Reliable and well-documented
   - ❌ Requires separate AWS account management

2. **Google Cloud Functions + Cloud Storage**
   - ✅ Full Node.js environment with DuckDB support
   - ✅ Natural integration with GA4 (same platform)
   - ✅ Can reuse existing GA service account
   - ✅ Slightly lower costs
   - ❌ Less community resources compared to AWS

3. **Deno Deploy + R2**
   - ✅ Could keep using Cloudflare infrastructure
   - ❌ Uncertain DuckDB support in Deno
   - ❌ Would require significant code changes

4. **Frontend-only Processing**
   - ✅ Could keep current architecture
   - ❌ Moves computational load to client
   - ❌ Potentially slower for users

### Decision Outcome

We chose **Google Cloud Functions + Cloud Storage** because:
1. Native support for DuckDB in Node.js environment
2. Natural integration with GA4 services
3. Can reuse existing GA service account and authentication
4. Cost-effective (similar to AWS but with better integration)

## Consequences

### Positive

- Reliable DuckDB processing in a full Node.js environment
- Simplified authentication and service integration
- Better scalability options
- Potentially better performance for data processing

### Negative

- Need to manage another cloud platform
- Migration effort required
- Slightly more complex deployment process
- Potential cold start issues with Cloud Functions

### Migration Tasks

1. Set up Google Cloud project
2. Migrate R2 storage to Cloud Storage
3. Rewrite Workers code as Cloud Functions
4. Update frontend to use new endpoints
5. Update documentation and deployment procedures 
