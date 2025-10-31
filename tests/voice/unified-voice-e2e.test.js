/*
  Unified Voice Router E2E (opt-in)
  Enable by setting VOICE_E2E=1 before running tests.
*/

import http from 'http';

const VOICE_E2E = process.env.VOICE_E2E === '1';
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

const httpGetJSON = (url) => new Promise((resolve, reject) => {
  const req = http.get(url, (res) => {
    const { statusCode } = res;
    let raw = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => { raw += chunk; });
    res.on('end', () => {
      try {
        const data = JSON.parse(raw || '{}');
        resolve({ statusCode, data });
      } catch (e) {
        resolve({ statusCode, data: {} });
      }
    });
  });
  req.on('error', reject);
});

(VOICE_E2E ? describe : describe.skip)('Unified Voice Router E2E', () => {
  test('GET /api/voice/stats returns health and modelPool', async () => {
    const { statusCode, data } = await httpGetJSON(`http://localhost:${PORT}/api/voice/stats`);
    expect(statusCode).toBe(200);
    expect(typeof data).toBe('object');
    expect(data).toHaveProperty('health');
    expect(data).toHaveProperty('modelPool');
  }, 15000);

  test('WebSocket ping/pong (if ws available)', async () => {
    let WebSocket;
    try {
      const mod = await import('ws');
      WebSocket = mod.default || mod;
    } catch (_) {
      // eslint-disable-next-line no-console
      console.warn('ws not installed at root; skipping WS test');
      return;
    }
    await new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:${PORT}/api/voice/ws`);
      const timer = setTimeout(() => reject(new Error('timeout waiting for pong')), 8000);
      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'ping' }));
      });
      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(String(data));
          if (msg && msg.type === 'pong') {
            clearTimeout(timer);
            ws.close();
            resolve();
          }
        } catch (_) {}
      });
      ws.on('error', reject);
    });
  }, 15000);
});


