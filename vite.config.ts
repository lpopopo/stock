import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import https from 'https'
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), savePredictionPlugin(), sinaNewsPlugin(), macroNewsPlugin(), fundStoragePlugin()],
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
      }
    }
  }
})
