const express = require('express');

const router = express.Router();

const holdbacks = [
  { id: 1, athlete: 'Jordan Hale', team: 'Metro FC', amount: 450000, trigger: 'physical clearance', releaseDate: '2026-06-15', status: 'medical pending' },
  { id: 2, athlete: 'Maya Chen', team: 'Bay City', amount: 125000, trigger: 'cap compliance review', releaseDate: '2026-05-31', status: 'league review' },
  { id: 3, athlete: 'T. Okafor', team: 'United', amount: 300000, trigger: 'appearance threshold', releaseDate: '2026-07-01', status: 'on track' },
];

router.get('/', (req, res) => {
  res.json({
    summary: {
      trackedHoldbacks: holdbacks.length,
      heldAmount: holdbacks.reduce((sum, item) => sum + item.amount, 0),
      pendingRelease: holdbacks.filter((item) => item.status !== 'on track').length,
    },
    holdbacks,
  });
});

router.post('/release-plan', (req, res) => {
  const item = holdbacks.find((entry) => entry.id === Number(req.body?.id)) || holdbacks[0];
  res.json({
    athlete: item.athlete,
    releasePlan: [`Confirm ${item.trigger}`, 'Notify team counsel', 'Prepare escrow release instruction'],
    risk: item.status === 'on track' ? 'standard monitoring' : 'requires agent follow-up',
  });
});

module.exports = router;
