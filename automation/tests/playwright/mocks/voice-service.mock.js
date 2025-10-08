// PLAYWRIGHT MCP DETERMINISTIC MOCKS - Voice Service
// Mission: Provide deterministic mocks for voice-service endpoints to ensure reliable E2E testing

export class VoiceServiceMock {
  constructor(page) {
    this.page = page;
  }

  async setupMocks() {
    // Mock ElevenLabs TTS synthesis
    await this.page.route('**/api/elevenlabs/synthesize', async route => {
      const request = route.request();
      const postData = JSON.parse(request.postData() || '{}');
      
      // Simulate TTS response with deterministic audio data
      const mockAudioBuffer = Buffer.from('mock-audio-data-' + postData.text);
      
      await route.fulfill({
        status: 200,
        contentType: 'audio/mpeg',
        body: mockAudioBuffer,
        headers: {
          'Content-Length': mockAudioBuffer.length.toString(),
          'X-Mock-Response': 'true'
        }
      });
    });

    // Mock voice list endpoint
    await this.page.route('**/api/elevenlabs/voices', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          voices: [
            {
              voice_id: "21m00Tcm4TlvDq8ikWAM",
              name: "Rachel",
              category: "premade",
              settings: {
                stability: 0.5,
                similarity_boost: 0.75
              }
            },
            {
              voice_id: "AZnzlk1XvdvUeBnXmlld",
              name: "Domi",
              category: "premade",
              settings: {
                stability: 0.5,
                similarity_boost: 0.75
              }
            }
          ]
        })
      });
    });

    // Mock reasoning job enqueue
    await this.page.route('**/api/reasoning/enqueue', async route => {
      const request = route.request();
      const postData = JSON.parse(request.postData() || '{}');
      
      const mockJobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          jobId: mockJobId,
          message: 'Reasoning job enqueued successfully',
          queueName: 'voice-mode-reasoning-jobs',
          estimatedProcessingTime: '10-30 seconds'
        })
      });
    });

    // Mock reasoning job result
    await this.page.route('**/api/reasoning/result/**', async route => {
      const url = route.request().url();
      const jobId = url.split('/').pop();
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          jobId: jobId,
          state: 'completed',
          result: `Mock reasoning response for job ${jobId}. This is a deterministic response for testing purposes.`,
          progress: 100,
          completedAt: new Date().toISOString()
        })
      });
    });

    // Mock reasoning job stream (SSE)
    await this.page.route('**/api/reasoning/stream/**', async route => {
      const url = route.request().url();
      const jobId = url.split('/').pop();
      
      // Simulate SSE stream with deterministic events
      const sseData = [
        `data: {"type":"connected","jobId":"${jobId}"}\n\n`,
        `data: {"type":"progress","progress":25}\n\n`,
        `data: {"type":"progress","progress":50}\n\n`,
        `data: {"type":"progress","progress":75}\n\n`,
        `data: {"type":"completed","result":"Mock reasoning complete","progress":100}\n\n`
      ].join('');
      
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        headers: {
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        },
        body: sseData
      });
    });

    // Mock queue statistics
    await this.page.route('**/api/reasoning/queue/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          stats: {
            waiting: 2,
            active: 1,
            completed: 150,
            failed: 3,
            total: 156
          }
        })
      });
    });

    // Mock health check
    await this.page.route('**/health', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'healthy',
          service: 'voice-service',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          features: {
            elevenlabs: true,
            reasoning: true,
            redis: true
          }
        })
      });
    });

    console.log('✅ Voice Service mocks configured for deterministic testing');
  }

  async teardownMocks() {
    // Unroute all mocked endpoints
    await this.page.unroute('**/api/elevenlabs/synthesize');
    await this.page.unroute('**/api/elevenlabs/voices');
    await this.page.unroute('**/api/reasoning/enqueue');
    await this.page.unroute('**/api/reasoning/result/**');
    await this.page.unroute('**/api/reasoning/stream/**');
    await this.page.unroute('**/api/reasoning/queue/stats');
    await this.page.unroute('**/health');
    
    console.log('✅ Voice Service mocks cleaned up');
  }
}
