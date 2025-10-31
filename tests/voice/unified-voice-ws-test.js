/**
 * Quick WebSocket Test for Unified Voice Router
 * Tests: connection, ping/pong, session establishment
 */

import WebSocket from 'ws';

const WS_URL = 'ws://localhost:8080/api/voice/ws';
const TIMEOUT = 5000;

async function testWebSocket() {
  console.log('🔌 Testing WebSocket connection to', WS_URL);
  
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    const results = {
      connected: false,
      sessionId: null,
      pingPong: false,
      errors: []
    };
    
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Test timeout after 5s'));
    }, TIMEOUT);
    
    ws.on('open', () => {
      console.log('✅ WebSocket connected');
      results.connected = true;
    });
    
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        console.log('📥 Received:', msg.type, msg);
        
        if (msg.type === 'session') {
          results.sessionId = msg.sessionId;
          console.log('✅ Session established:', results.sessionId);
          
          // Test ping/pong
          console.log('📤 Sending ping...');
          ws.send(JSON.stringify({ type: 'ping' }));
        }
        
        if (msg.type === 'pong') {
          results.pingPong = true;
          console.log('✅ Pong received');
          
          // Test stats request
          console.log('📤 Requesting stats...');
          ws.send(JSON.stringify({ type: 'stats' }));
        }
        
        if (msg.type === 'stats') {
          console.log('✅ Stats received:', msg.session);
          clearTimeout(timeout);
          ws.close();
          resolve(results);
        }
        
        if (msg.type === 'error') {
          results.errors.push(msg.error);
          console.error('❌ Server error:', msg.error);
        }
      } catch (err) {
        console.log('📦 Binary message received (length:', data.length, 'bytes)');
      }
    });
    
    ws.on('error', (err) => {
      console.error('❌ WebSocket error:', err.message);
      results.errors.push(err.message);
      clearTimeout(timeout);
      reject(err);
    });
    
    ws.on('close', () => {
      console.log('🔌 WebSocket closed');
      clearTimeout(timeout);
      if (!results.sessionId) {
        reject(new Error('Connection closed before session established'));
      }
    });
  });
}

// Run test
testWebSocket()
  .then((results) => {
    console.log('\n📊 Test Results:');
    console.log('  Connected:', results.connected ? '✅' : '❌');
    console.log('  Session ID:', results.sessionId ? '✅' : '❌');
    console.log('  Ping/Pong:', results.pingPong ? '✅' : '❌');
    console.log('  Errors:', results.errors.length === 0 ? '✅ None' : `❌ ${results.errors.length}`);
    
    if (results.connected && results.sessionId && results.pingPong && results.errors.length === 0) {
      console.log('\n✅ ALL WEBSOCKET TESTS PASSED');
      process.exit(0);
    } else {
      console.log('\n❌ SOME TESTS FAILED');
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });

