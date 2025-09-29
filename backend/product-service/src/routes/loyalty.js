import { Router } from 'express';

export const createLoyaltyRouter = ({ logger }) => {
  const router = Router();

  router.get('/:memberId/loyalty', async (req, res) => {
    const { memberId } = req.params;
    logger.info({ memberId }, 'Fetching loyalty state');
    res.status(200).json({
      memberId,
      tier: 'Member',
      points: 150,
      freeGramCredits: 3,
      rewards: [{ id: 'reward-free-gram', label: 'Free Gram available' }],
    });
  });

  router.post('/:memberId/loyalty/redeem', async (req, res) => {
    const { memberId } = req.params;
    const { rewardId } = req.body;
    logger.info({ memberId, rewardId }, 'Redeeming reward');
    res.status(200).json({ status: 'redeemed', rewardId });
  });

  return router;
};
