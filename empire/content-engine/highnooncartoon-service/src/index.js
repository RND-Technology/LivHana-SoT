import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static('public'));

// Redirect to Episode 1
app.get('/', (req, res) => {
  res.redirect('https://storage.googleapis.com/hnc-episodes-prod/index.html');
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'highnooncartoon-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`High Noon Cartoon service running on port ${PORT}`);
});
