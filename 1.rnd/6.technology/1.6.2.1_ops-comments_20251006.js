/**
 * OPS Comments Routes for DSHS Email
 * Public Commenting System for TTSA and ACFA
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../../common/logging/index.js';

const router = express.Router();
const logger = createLogger('ops-comments');

// In-memory store for comments (for rapid prototyping)
const comments = {
  ttsa: [],
  acfa: []
};

// Submit a comment for a policy
router.post('/:policy', (req, res) => {
  const { policy } = req.params;
  const { author, content } = req.body;

  if (!['ttsa', 'acfa'].includes(policy)) {
    return res.status(400).json({ error: 'Invalid policy type. Must be "ttsa" or "acfa".' });
  }
  if (!author || !content) {
    return res.status(400).json({ error: 'Author and content are required.' });
  }

  const newComment = {
    id: uuidv4(),
    author,
    content,
    timestamp: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0
  };

  comments[policy].push(newComment);
  logger.info(`New comment for ${policy}`, { requestId: req.requestId, commentId: newComment.id });
  res.status(201).json({ message: 'Comment submitted successfully', comment: newComment });
});

// Get all comments for a policy
router.get('/:policy', (req, res) => {
  const { policy } = req.params;

  if (!['ttsa', 'acfa'].includes(policy)) {
    return res.status(400).json({ error: 'Invalid policy type. Must be "ttsa" or "acfa".' });
  }

  const sortedComments = [...comments[policy]].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  logger.info(`Retrieved comments for ${policy}`, { requestId: req.requestId, count: sortedComments.length });
  res.status(200).json(sortedComments);
});

// Vote on a comment
router.post('/:policy/:commentId/vote', (req, res) => {
  const { policy, commentId } = req.params;
  const { type } = req.body; // 'upvote' or 'downvote'

  if (!['ttsa', 'acfa'].includes(policy)) {
    return res.status(400).json({ error: 'Invalid policy type. Must be "ttsa" or "acfa".' });
  }
  if (!['upvote', 'downvote'].includes(type)) {
    return res.status(400).json({ error: 'Invalid vote type. Must be "upvote" or "downvote".' });
  }

  const commentIndex = comments[policy].findIndex(c => c.id === commentId);

  if (commentIndex === -1) {
    return res.status(404).json({ error: 'Comment not found.' });
  }

  if (type === 'upvote') {
    comments[policy][commentIndex].upvotes++;
  } else {
    comments[policy][commentIndex].downvotes++;
  }

  logger.info(`Vote recorded for comment ${commentId} on ${policy}`, { requestId: req.requestId, type });
  res.status(200).json({ message: 'Vote recorded successfully', comment: comments[policy][commentIndex] });
});

// Get statistics for a policy
router.get('/:policy/stats', (req, res) => {
  const { policy } = req.params;

  if (!['ttsa', 'acfa'].includes(policy)) {
    return res.status(400).json({ error: 'Invalid policy type. Must be "ttsa" or "acfa".' });
  }

  const policyComments = comments[policy];
  const totalComments = policyComments.length;
  const totalUpvotes = policyComments.reduce((sum, c) => sum + c.upvotes, 0);
  const totalDownvotes = policyComments.reduce((sum, c) => sum + c.downvotes, 0);

  const stats = {
    policy,
    totalComments,
    totalUpvotes,
    totalDownvotes,
    timestamp: new Date().toISOString()
  };

  logger.info(`Retrieved stats for ${policy}`, { requestId: req.requestId, stats });
  res.status(200).json(stats);
});

export default router;
