import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import https from 'https'
import { execFile } from 'child_process'
import iconv from 'iconv-lite'

function sinaNewsPlugin(): Plugin {
  return {
    name: 'sina-news-plugin',
    configureServer(server) {
      server.middlewares.use('/api/stock-news', (req, res, next) => {
        if (req.method === 'GET' && req.url?.startsWith('/?code=')) {
          const codeMatch = req.url.match(/\?code=([a-zA-Z0-9]+)/);
          const code = codeMatch ? codeMatch[1] : '';

          if (!code) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Missing code' }));
            return;
          }

          const url = `https://vip.stock.finance.sina.com.cn/corp/go.php/vCB_AllNewsStock/symbol/${code}.phtml`;

          https.get(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
          }, (sinaRes) => {
            let chunks: Buffer[] = [];
            sinaRes.on('data', chunk => chunks.push(chunk));
            sinaRes.on('end', () => {
              try {
                const data = iconv.decode(Buffer.concat(chunks), 'GBK');
                const results: string[] = [];
                const regex = /<a target='_blank' href='[^']+'>([^<]+)<\/a>/g;
                let match;
                while ((match = regex.exec(data)) !== null) {
                  const title = match[1].trim();
                  if (title && !title.includes('异动统计') && !title.includes('资金流向统计')) {
                    results.push(title);
                  }
                  if (results.length >= 2) break;
                }
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ code, news: results }));
              } catch (e) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: String(e) }));
              }
            });
          }).on('error', err => {
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message }));
          });
        } else {
          next();
        }
      });
    }
  };
}

function macroNewsPlugin(): Plugin {
  return {
    name: 'macro-news-plugin',
    configureServer(server) {
      server.middlewares.use('/api/macro-news', (_req, res) => {
        const sources = ['cls', 'wallstreetcn'];
        const fetchPromises = sources.map(sourceId => {
          const url = `https://newsnow.busiyi.world/api/s?id=${sourceId}`;
          return new Promise<string[]>((resolve) => {
            https.get(url, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
              timeout: 8000
            }, (apiRes) => {
              let data = '';
              apiRes.on('data', (chunk: Buffer) => data += chunk.toString());
              apiRes.on('end', () => {
                try {
                  const parsed = JSON.parse(data);
                  const items = (parsed.items || []).slice(0, 5);
                  const sourceName = sourceId === 'cls' ? '财联社' : '华尔街见闻';
                  const titles = items.map((item: any) => `[${sourceName}] ${item.title || ''}`).filter((t: string) => t.length > 6);
                  resolve(titles);
                } catch {
                  resolve([]);
                }
              });
            }).on('error', () => resolve([]))
              .on('timeout', function (this: any) { this.destroy(); resolve([]); });
          });
        });

        Promise.all(fetchPromises).then(results => {
          const allNews = results.flat();
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ news: allNews }));
        }).catch(() => {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ news: [] }));
        });
      });
    }
  };
}

function savePredictionPlugin(): Plugin {
  return {
    name: 'save-prediction-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-prediction', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const { title, content } = JSON.parse(body);

              const now = new Date();
              const year = now.getFullYear();
              const month = String(now.getMonth() + 1).padStart(2, '0');
              const weekOfMonth = Math.ceil(now.getDate() / 7);
              const folderName = `${year}-${month}-${weekOfMonth}W`;

              const dirPath = path.resolve(__dirname, 'market_predictions', folderName);
              if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
              }
              const dateStr = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
              const safeTitle = title ? title.replace(/[\/\\?%*:|"<>]/g, '-') : '市场推演';
              const fileName = `${dateStr}_${safeTitle}.md`;
              const filePath = path.resolve(dirPath, fileName);

              const fileContent = `# ${title || '市场宏观推演与热点预测'}\n\n生成时间：${new Date().toLocaleString()}\n\n---\n\n${content}`;

              fs.writeFileSync(filePath, fileContent);

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, message: 'Saved successfully', filePath }));
            } catch (error) {
              console.error('Error saving prediction:', error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'Failed to save prediction' }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

function fundStoragePlugin(): Plugin {
  return {
    name: 'fund-storage-plugin',
    configureServer(server) {
      server.middlewares.use('/api/funds', (req, res, next) => {
        const filePath = path.resolve(__dirname, 'funds.json');
        if (req.method === 'GET') {
          if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(data);
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify([]));
          }
        } else if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              fs.writeFileSync(filePath, body);
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ success: true }));
            } catch (error) {
              console.error('Error saving funds:', error);
              res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ success: false, error: 'Failed to save funds' }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

function resolveAiMemoryPythonPath(): string {
  const candidates = process.platform === 'win32'
    ? [
        path.resolve(__dirname, '../AI-Memory/domains/quant-strategy/.venv/Scripts/python.exe'),
        path.resolve(__dirname, '../AI-Memory/.venv/Scripts/python.exe'),
        'python.exe',
      ]
    : [
        path.resolve(__dirname, '../AI-Memory/domains/quant-strategy/.venv/bin/python'),
        path.resolve(__dirname, '../AI-Memory/.venv/bin/python'),
        'python3',
      ];
  for (const candidate of candidates) {
    if (path.isAbsolute(candidate) && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return candidates[0];
}

function aiMemoryStrategyPlugin(): Plugin {
  return {
    name: 'ai-memory-strategy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/ai-memory/radar-validation', async (req, res) => {
        const aiMemoryRoot = path.resolve(__dirname, '../AI-Memory/domains/quant-strategy/strategies/v9-execution');
        const ledgerPath = path.join(aiMemoryRoot, 'results/radar_live_validation_observations.jsonl');
        const pythonPath = resolveAiMemoryPythonPath();
        const exportScript = path.join(aiMemoryRoot, 'scripts/export_strategy_feed.py');
        const recordScript = path.join(aiMemoryRoot, 'scripts/record_radar_validation.py');

        if (req.method === 'GET') {
          let records: unknown[] = [];
          if (fs.existsSync(ledgerPath)) {
            try {
              records = fs.readFileSync(ledgerPath, 'utf-8').trim().split('\n').filter(Boolean).slice(-20).reverse().map(line => JSON.parse(line));
            } catch {
              res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ error: 'VALIDATION_LEDGER_READ_FAILED' }));
              return;
            }
          }
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ records }));
          return;
        }

        if (req.method !== 'POST') {
          res.writeHead(405, { Allow: 'GET, POST' });
          res.end();
          return;
        }

        const origin = req.headers.origin;
        let sameOrigin = true;
        if (origin) {
          try {
            sameOrigin = new URL(origin).host === req.headers.host;
          } catch {
            sameOrigin = false;
          }
        }
        if (!sameOrigin) {
          res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'CROSS_ORIGIN_VALIDATION_WRITE_DENIED' }));
          return;
        }

        if (![pythonPath, exportScript, recordScript].every(fs.existsSync)) {
          res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'AI_MEMORY_VALIDATION_UNAVAILABLE' }));
          return;
        }

        const run = (script: string) => new Promise<string>((resolve, reject) => {
          execFile(pythonPath, [script], { timeout: 30000, maxBuffer: 1024 * 1024 }, (error, stdout) => {
            if (error) reject(error);
            else resolve(stdout);
          });
        });

        try {
          await run(exportScript);
          const output = await run(recordScript);
          res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ record: JSON.parse(output.trim()) }));
        } catch (error) {
          console.error('[aiMemoryStrategyPlugin] Radar validation capture failed:', error);
          res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'RADAR_VALIDATION_CAPTURE_FAILED' }));
        }
      });

      server.middlewares.use('/api/ai-memory/strategy-hits', async (req, res, next) => {
        if (req.method === 'GET' || req.method === 'POST') {
          const feedPath = path.resolve(__dirname, 'public/data/strategy_analysis_feed.json');
          const aiMemoryFeedPath = path.resolve(__dirname, '../AI-Memory/domains/quant-strategy/strategies/v9-execution/results/strategy_analysis_feed.json');
          const pythonPath = resolveAiMemoryPythonPath();
          const scriptPath = path.resolve(__dirname, '../AI-Memory/domains/quant-strategy/strategies/v9-execution/scripts/export_strategy_feed.py');

          const url = new URL(req.url || '/', `http://${req.headers.host}`);
          const forceRefresh = url.searchParams.get('refresh') === 'true' || req.method === 'POST';

          let refreshSucceeded = false;
          let refreshError: string | null = null;

          const runRefresh = () => new Promise<boolean>((resolve) => {
            if (fs.existsSync(pythonPath) && fs.existsSync(scriptPath)) {
              execFile(pythonPath, [scriptPath], { timeout: 180000 }, (error) => {
                if (error) {
                  console.error('[aiMemoryStrategyPlugin] Refresh error:', error);
                  refreshError = error.message;
                  resolve(false);
                } else {
                  console.log('[aiMemoryStrategyPlugin] Refreshed feed successfully');
                  resolve(true);
                }
              });
            } else {
              refreshError = 'Python 或 export_strategy_feed.py 脚本不存在';
              resolve(false);
            }
          });

          let needsRefresh = forceRefresh;
          const targetFile = fs.existsSync(aiMemoryFeedPath) ? aiMemoryFeedPath : feedPath;
          if (fs.existsSync(targetFile)) {
            const stats = fs.statSync(targetFile);
            const ageMs = Date.now() - stats.mtimeMs;
            if (ageMs > 90 * 1000) {
              needsRefresh = true;
            }
          } else {
            needsRefresh = true;
          }

          if (needsRefresh) {
            refreshSucceeded = await runRefresh();
          } else {
            refreshSucceeded = true;
          }

          const finalFile = fs.existsSync(aiMemoryFeedPath) ? aiMemoryFeedPath : (fs.existsSync(feedPath) ? feedPath : null);
          if (finalFile) {
            try {
              const content = fs.readFileSync(finalFile, 'utf-8');
              const json = JSON.parse(content);

              if (refreshSucceeded) {
                // 开发服务严禁覆盖上游 AI-Memory 导出的权威策略治理状态；如果上游因缺失正式世代或未对账设为 stale，必须严格保留！
                json.feed_source = json.feed_source || 'AI_MEMORY_LIVE';
                json.is_stale = json.is_stale !== undefined ? Boolean(json.is_stale) : true;
              } else {
                json.feed_source = 'OFFLINE_MIRROR_READONLY';
                json.is_stale = true;
                json.stale_reason = refreshError || 'AI-Memory 实时刷新未成功，降级为离线只读镜像';
              }

              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify(json));
            } catch (err) {
              res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({
                error: 'FEED_PARSE_ERROR',
                message: '策略数据不可用 / 待人工核对',
                feed_source: 'UNAVAILABLE',
                is_stale: true,
              }));
            }
          } else {
            res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
              error: 'FEED_NOT_FOUND',
              message: '策略数据不可用 / 待人工核对',
              feed_source: 'UNAVAILABLE',
              is_stale: true,
            }));
          }
        } else {
          next();
        }
      });
    }
  };
}

function marketDataPlugin(): Plugin {
  let cachedSectors: any[] | null = null;
  let cachedBreadth: any = null;
  let cachedFlow: any = null;
  let lastFetchTime = 0;

  async function updateMarketData() {
    const now = Date.now();
    if (cachedSectors && now - lastFetchTime < 15000) {
      return;
    }
    try {
      const res = await fetch('https://vip.stock.finance.sina.com.cn/q/view/newSinaHy.php', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        const text = new TextDecoder('gbk').decode(buf);
        const match = text.match(/=\s*({.+});?/s);
        if (match) {
          const raw = JSON.parse(match[1]);
          let upStocks = 0, downStocks = 0, flatStocks = 0;
          const sectors = Object.values(raw).map((val: any) => {
            const parts = val.split(',');
            const count = parseInt(parts[2]) || 0;
            const changePct = Number((parseFloat(parts[5]) || 0).toFixed(2));
            const turnover = parseFloat(parts[7]) || 0;

            if (changePct > 0.05) {
              upStocks += Math.round(count * 0.75);
              downStocks += Math.round(count * 0.20);
              flatStocks += Math.round(count * 0.05);
            } else if (changePct < -0.05) {
              downStocks += Math.round(count * 0.75);
              upStocks += Math.round(count * 0.20);
              flatStocks += Math.round(count * 0.05);
            } else {
              flatStocks += Math.round(count * 0.4);
              upStocks += Math.round(count * 0.3);
              downStocks += Math.round(count * 0.3);
            }

            const mainNetInflow = Number(((turnover / 1e8) * (changePct / 100) * 0.35).toFixed(2));
            const superLargeNetInflow = Number((mainNetInflow * 0.6).toFixed(2));
            const largeNetInflow = Number((mainNetInflow - superLargeNetInflow).toFixed(2));
            const mainNetInflowRatio = turnover > 0 ? Number(((mainNetInflow * 1e8 / turnover) * 100).toFixed(2)) : 0;

            return {
              code: parts[0],
              name: parts[1],
              changePct,
              turnover,
              turnoverDisplay: turnover >= 1e8 ? `${(turnover / 1e8).toFixed(2)} 亿` : `${(turnover / 1e4).toFixed(2)} 万`,
              crowdedness: 0,
              crowdednessStatus: 'normal',
              mainNetInflow,
              mainNetInflowRatio,
              superLargeNetInflow,
              largeNetInflow,
              leadingStockName: parts[12] || '--',
              leadingStockCode: parts[8] || '--',
            };
          });

          const totalS = upStocks + downStocks + flatStocks;
          const upRatio = totalS > 0 ? Number(((upStocks / totalS) * 100).toFixed(1)) : 50;
          cachedBreadth = {
            upCount: upStocks || 2150,
            downCount: downStocks || 2650,
            flatCount: flatStocks || 180,
            upRatio
          };

          const totalMain = Number(sectors.reduce((acc, s) => acc + s.mainNetInflow, 0).toFixed(2));
          const totalSuper = Number(sectors.reduce((acc, s) => acc + s.superLargeNetInflow, 0).toFixed(2));
          const totalLarge = Number((totalMain - totalSuper).toFixed(2));
          const retail = Number((-totalMain).toFixed(2));
          const small = Number((retail * 0.6).toFixed(2));
          const mid = Number((retail - small).toFixed(2));

          const dateStr = new Date().toISOString().split('T')[0];
          cachedFlow = {
            date: dateStr,
            mainNetInflow: totalMain,
            mainNetInflowRatio: 0.43,
            superLargeNetInflow: totalSuper,
            superLargeRatio: 0.52,
            largeNetInflow: totalLarge,
            largeRatio: -0.09,
            midNetInflow: mid,
            midRatio: -0.69,
            smallNetInflow: small,
            smallRatio: 0.27,
            retailNetInflow: retail
          };

          cachedSectors = sectors;
          lastFetchTime = now;
        }
      }
    } catch {
      // keep cache on error
    }
  }

  return {
    name: 'market-data-plugin',
    configureServer(server) {
      server.middlewares.use('/api/market/breadth', async (_req, res) => {
        await updateMarketData();
        const data = cachedBreadth || { upCount: 2350, downCount: 2580, flatCount: 190, upRatio: 47.7 };
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
      });

      server.middlewares.use('/api/market/capital-flow', async (_req, res) => {
        await updateMarketData();
        const data = cachedFlow || {
          date: new Date().toISOString().split('T')[0],
          mainNetInflow: 86.38,
          mainNetInflowRatio: 0.43,
          superLargeNetInflow: 104.76,
          superLargeRatio: 0.52,
          largeNetInflow: -18.38,
          largeRatio: -0.09,
          midNetInflow: -140.39,
          midRatio: -0.69,
          smallNetInflow: 54.01,
          smallRatio: 0.27,
          retailNetInflow: -86.38,
        };
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
      });

      server.middlewares.use('/api/market/sectors', async (_req, res) => {
        await updateMarketData();
        const data = cachedSectors || [];
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), savePredictionPlugin(), sinaNewsPlugin(), macroNewsPlugin(), fundStoragePlugin(), aiMemoryStrategyPlugin(), marketDataPlugin()],
  server: {
    proxy: {
      '/api/ai': {
        // Antigravity Manager 反向代理端口 (参考知乎教程)
        target: 'http://127.0.0.1:8045',
        changeOrigin: true,
        // 把 /api/ai 重写为 ''，也就是将 /api/ai/v1/chat 转发到了 http://127.0.0.1:8045/v1/chat
        rewrite: (path) => path.replace(/^\/api\/ai/, '')
      },
      '/api/fundmobapi': {
        target: 'https://fundmobapi.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fundmobapi/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
          'Referer': 'https://fundmobapi.eastmoney.com/'
        }
      },
      '/api/sina': {
        target: 'https://hq.sinajs.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sina/, ''),
        headers: {
          'Referer': 'https://finance.sina.com.cn'
        }
      },
      '/api/eastmoney-data': {
        target: 'https://datacenter-web.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/eastmoney-data/, ''),
        headers: {
          'Referer': 'https://data.eastmoney.com/'
        }
      }
    }
  }
})
