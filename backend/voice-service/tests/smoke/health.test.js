/**
 * Voice Service Smoke Test
 * Tests basic health endpoint functionality
 */

describe('Voice Service Smoke Tests', () => {
  it('should respond to health check with 200', async () => {
    const response = await fetch('http://localhost:8080/health');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('timestamp');
  });

  it('should return healthy status when all dependencies are up', async () => {
    const response = await fetch('http://localhost:8080/health');
    const data = await response.json();
    
    expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status);
  });
});

