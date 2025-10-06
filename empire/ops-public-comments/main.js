#!/usr/bin/env node

/**
 * OPS PUBLIC COMMENTING SYSTEM - CHEETAH SPEED BUILD
 * 
 * Policy By The People For The People
 * TTSA & ACFA Public Commenting
 * 
 * USAGE:
 * 1. Deploy: gcloud run deploy ops-public-comments --source .
 * 2. Done: Public commenting live
 * 
 * FEATURES:
 * - Submit comments on TTSA
 * - Submit comments on ACFA
 * - View all comments
 * - Vote on comments
 * - Real-time updates
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data storage (simple file-based for now)
const COMMENTS_FILE = './comments.json';

// Initialize comments file if it doesn't exist
if (!fs.existsSync(COMMENTS_FILE)) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify({
    ttsa: [],
    acfa: []
  }));
}

// Helper functions
function readComments() {
  try {
    const data = fs.readFileSync(COMMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { ttsa: [], acfa: [] };
  }
}

function writeComments(comments) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
}

// Routes

// Get all comments for a policy
app.get('/api/comments/:policy', (req, res) => {
  const { policy } = req.params;
  const comments = readComments();
  
  if (!comments[policy]) {
    return res.status(404).json({ error: 'Policy not found' });
  }
  
  res.json({
    policy,
    comments: comments[policy],
    total: comments[policy].length
  });
});

// Submit a comment
app.post('/api/comments/:policy', (req, res) => {
  const { policy } = req.params;
  const { name, email, comment, section } = req.body;
  
  if (!name || !comment) {
    return res.status(400).json({ error: 'Name and comment are required' });
  }
  
  const comments = readComments();
  
  if (!comments[policy]) {
    comments[policy] = [];
  }
  
  const newComment = {
    id: Date.now().toString(),
    name,
    email: email || '',
    comment,
    section: section || 'general',
    timestamp: new Date().toISOString(),
    votes: 0,
    voters: []
  };
  
  comments[policy].push(newComment);
  writeComments(comments);
  
  res.json({
    success: true,
    comment: newComment
  });
});

// Vote on a comment
app.post('/api/comments/:policy/:commentId/vote', (req, res) => {
  const { policy, commentId } = req.params;
  const { voterId } = req.body;
  
  const comments = readComments();
  
  if (!comments[policy]) {
    return res.status(404).json({ error: 'Policy not found' });
  }
  
  const comment = comments[policy].find(c => c.id === commentId);
  
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  
  // Check if already voted
  if (comment.voters.includes(voterId)) {
    return res.status(400).json({ error: 'Already voted' });
  }
  
  // Add vote
  comment.votes += 1;
  comment.voters.push(voterId);
  
  writeComments(comments);
  
  res.json({
    success: true,
    votes: comment.votes
  });
});

// Get comment statistics
app.get('/api/stats/:policy', (req, res) => {
  const { policy } = req.params;
  const comments = readComments();
  
  if (!comments[policy]) {
    return res.status(404).json({ error: 'Policy not found' });
  }
  
  const stats = {
    totalComments: comments[policy].length,
    totalVotes: comments[policy].reduce((sum, c) => sum + c.votes, 0),
    sections: {}
  };
  
  // Count by section
  comments[policy].forEach(comment => {
    const section = comment.section;
    if (!stats.sections[section]) {
      stats.sections[section] = 0;
    }
    stats.sections[section]++;
  });
  
  res.json(stats);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ops-public-comments',
    timestamp: new Date().toISOString(),
    features: ['ttsa-comments', 'acfa-comments', 'voting', 'stats']
  });
});

// Serve the frontend
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OPS Public Comments - Policy By The People</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #DC2626 0%, #F59E0B 50%, #16A34A 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .header h1 { font-size: 2rem; margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        .policy-tabs { display: flex; gap: 10px; margin-bottom: 20px; }
        .tab { padding: 10px 20px; background: white; border: 2px solid #e5e5e5; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
        .tab.active { background: #DC2626; color: white; border-color: #DC2626; }
        .tab:hover { border-color: #DC2626; }
        .policy-content { display: none; }
        .policy-content.active { display: block; }
        .comment-form { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 600; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
        .form-group textarea { height: 100px; resize: vertical; }
        .btn { background: #DC2626; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
        .btn:hover { background: #B91C1C; }
        .comments-list { background: white; border-radius: 8px; overflow: hidden; }
        .comment { padding: 15px; border-bottom: 1px solid #eee; }
        .comment:last-child { border-bottom: none; }
        .comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .comment-author { font-weight: 600; color: #DC2626; }
        .comment-time { color: #666; font-size: 12px; }
        .comment-section { background: #f0f0f0; padding: 2px 8px; border-radius: 12px; font-size: 12px; color: #666; }
        .comment-text { margin-bottom: 10px; line-height: 1.5; }
        .comment-votes { display: flex; align-items: center; gap: 10px; }
        .vote-btn { background: #16A34A; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
        .vote-btn:hover { background: #15803D; }
        .vote-count { font-weight: 600; color: #16A34A; }
        .stats { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .stat-card { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .stat-number { font-size: 2rem; font-weight: 700; color: #DC2626; }
        .stat-label { color: #666; font-size: 14px; }
        .loading { text-align: center; padding: 20px; color: #666; }
        .error { background: #FEE2E2; color: #DC2626; padding: 10px; border-radius: 4px; margin-bottom: 10px; }
        .success { background: #DCFCE7; color: #16A34A; padding: 10px; border-radius: 4px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤠 OPS Public Comments</h1>
            <p>Policy By The People For The People - TTSA & ACFA</p>
        </div>
        
        <div class="policy-tabs">
            <div class="tab active" onclick="showPolicy('ttsa')">TTSA</div>
            <div class="tab" onclick="showPolicy('acfa')">ACFA</div>
        </div>
        
        <div id="ttsa-content" class="policy-content active">
            <div class="stats" id="ttsa-stats">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number" id="ttsa-total">0</div>
                        <div class="stat-label">Total Comments</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="ttsa-votes">0</div>
                        <div class="stat-label">Total Votes</div>
                    </div>
                </div>
            </div>
            
            <div class="comment-form">
                <h3>Submit Comment on TTSA</h3>
                <form id="ttsa-form">
                    <div class="form-group">
                        <label>Name *</label>
                        <input type="text" id="ttsa-name" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="ttsa-email">
                    </div>
                    <div class="form-group">
                        <label>Section</label>
                        <select id="ttsa-section">
                            <option value="general">General</option>
                            <option value="purpose">Purpose & Findings</option>
                            <option value="definitions">Definitions</option>
                            <option value="regulatory">Regulatory Framework</option>
                            <option value="enforcement">Enforcement</option>
                            <option value="implementation">Implementation</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Comment *</label>
                        <textarea id="ttsa-comment" required placeholder="Share your thoughts on the Texas Truth & Safety Act..."></textarea>
                    </div>
                    <button type="submit" class="btn">Submit Comment</button>
                </form>
            </div>
            
            <div class="comments-list" id="ttsa-comments">
                <div class="loading">Loading comments...</div>
            </div>
        </div>
        
        <div id="acfa-content" class="policy-content">
            <div class="stats" id="acfa-stats">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number" id="acfa-total">0</div>
                        <div class="stat-label">Total Comments</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="acfa-votes">0</div>
                        <div class="stat-label">Total Votes</div>
                    </div>
                </div>
            </div>
            
            <div class="comment-form">
                <h3>Submit Comment on ACFA</h3>
                <form id="acfa-form">
                    <div class="form-group">
                        <label>Name *</label>
                        <input type="text" id="acfa-name" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="acfa-email">
                    </div>
                    <div class="form-group">
                        <label>Section</label>
                        <select id="acfa-section">
                            <option value="general">General</option>
                            <option value="descheduling">Federal Descheduling</option>
                            <option value="commerce">Interstate Commerce</option>
                            <option value="banking">Banking & Financial Services</option>
                            <option value="taxation">Taxation</option>
                            <option value="implementation">Implementation</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Comment *</label>
                        <textarea id="acfa-comment" required placeholder="Share your thoughts on the American Cannabis Freedom Act..."></textarea>
                    </div>
                    <button type="submit" class="btn">Submit Comment</button>
                </form>
            </div>
            
            <div class="comments-list" id="acfa-comments">
                <div class="loading">Loading comments...</div>
            </div>
        </div>
    </div>
    
    <script>
        let currentPolicy = 'ttsa';
        
        function showPolicy(policy) {
            currentPolicy = policy;
            
            // Update tabs
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab')[policy === 'ttsa' ? 0 : 1].classList.add('active');
            
            // Update content
            document.querySelectorAll('.policy-content').forEach(content => content.classList.remove('active'));
            document.getElementById(policy + '-content').classList.add('active');
            
            // Load data
            loadStats(policy);
            loadComments(policy);
        }
        
        function loadStats(policy) {
            fetch(\`/api/stats/\${policy}\`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById(\`\${policy}-total\`).textContent = data.totalComments;
                    document.getElementById(\`\${policy}-votes\`).textContent = data.totalVotes;
                })
                .catch(error => console.error('Error loading stats:', error));
        }
        
        function loadComments(policy) {
            fetch(\`/api/comments/\${policy}\`)
                .then(response => response.json())
                .then(data => {
                    const container = document.getElementById(\`\${policy}-comments\`);
                    
                    if (data.comments.length === 0) {
                        container.innerHTML = '<div class="loading">No comments yet. Be the first to comment!</div>';
                        return;
                    }
                    
                    container.innerHTML = data.comments.map(comment => \`
                        <div class="comment">
                            <div class="comment-header">
                                <div>
                                    <span class="comment-author">\${comment.name}</span>
                                    <span class="comment-section">\${comment.section}</span>
                                </div>
                                <div class="comment-time">\${new Date(comment.timestamp).toLocaleString()}</div>
                            </div>
                            <div class="comment-text">\${comment.comment}</div>
                            <div class="comment-votes">
                                <button class="vote-btn" onclick="voteComment('\${policy}', '\${comment.id}')">👍 Vote</button>
                                <span class="vote-count">\${comment.votes} votes</span>
                            </div>
                        </div>
                    \`).join('');
                })
                .catch(error => {
                    console.error('Error loading comments:', error);
                    document.getElementById(\`\${policy}-comments\`).innerHTML = '<div class="error">Error loading comments</div>';
                });
        }
        
        function voteComment(policy, commentId) {
            const voterId = 'user_' + Date.now();
            
            fetch(\`/api/comments/\${policy}/\${commentId}/vote\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ voterId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadComments(policy);
                    loadStats(policy);
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error voting:', error);
                alert('Error voting on comment');
            });
        }
        
        function submitComment(policy) {
            const form = document.getElementById(\`\${policy}-form\`);
            const formData = new FormData(form);
            
            const data = {
                name: document.getElementById(\`\${policy}-name\`).value,
                email: document.getElementById(\`\${policy}-email\`).value,
                section: document.getElementById(\`\${policy}-section\`).value,
                comment: document.getElementById(\`\${policy}-comment\`).value
            };
            
            fetch(\`/api/comments/\${policy}\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    // Clear form
                    form.reset();
                    
                    // Reload comments and stats
                    loadComments(policy);
                    loadStats(policy);
                    
                    // Show success message
                    const container = document.getElementById(\`\${policy}-comments\`);
                    const successDiv = document.createElement('div');
                    successDiv.className = 'success';
                    successDiv.textContent = 'Comment submitted successfully!';
                    container.insertBefore(successDiv, container.firstChild);
                    
                    setTimeout(() => successDiv.remove(), 3000);
                } else {
                    alert('Error: ' + result.error);
                }
            })
            .catch(error => {
                console.error('Error submitting comment:', error);
                alert('Error submitting comment');
            });
        }
        
        // Form submissions
        document.getElementById('ttsa-form').addEventListener('submit', (e) => {
            e.preventDefault();
            submitComment('ttsa');
        });
        
        document.getElementById('acfa-form').addEventListener('submit', (e) => {
            e.preventDefault();
            submitComment('acfa');
        });
        
        // Load initial data
        loadStats('ttsa');
        loadComments('ttsa');
    </script>
</body>
</html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 OPS Public Comments running on port ${PORT}`);
  console.log(`📜 TTSA & ACFA commenting live`);
  console.log(`🗳️ Policy By The People For The People`);
});
