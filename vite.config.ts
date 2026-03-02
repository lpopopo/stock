import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), savePredictionPlugin()],
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
