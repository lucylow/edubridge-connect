const express = require('express');
const router = express.Router();
const { getMatches, invalidateMatchCache } = require('../services/matchingService');
const { searchLimiter } = require('../middleware/security');

/**
 * @route   GET /api/matches
 * @desc    Get tutor matches for authenticated learner
 * @access  Private
 */
router.get('/', searchLimiter, async (req, res) => {
  try {
    const { subjectName, preferredTime } = req.query;
    const learnerId = req.user.id; // Assuming auth middleware sets req.user

    if (!subjectName) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'subjectName is required',
      });
    }

    const matches = await getMatches(
      learnerId,
      subjectName,
      preferredTime ? new Date(preferredTime) : null
    );

    res.json({
      success: true,
      count: matches.length,
      matches: matches.map(({ tutor, score }) => ({
        tutor: {
          id: tutor.id,
          name: tutor.name || tutor.full_name,
          avatar: tutor.avatar_url,
          bio: tutor.bio,
          subjects: tutor.subjects,
        },
        score: Math.round(score * 100), // Convert to percentage
        matchPercentage: Math.round(score * 100),
      })),
    });
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get matches',
    });
  }
});

/**
 * @route   POST /api/matches/invalidate
 * @desc    Invalidate match cache (e.g., after updating preferences)
 * @access  Private
 */
router.post('/invalidate', async (req, res) => {
  try {
    const userId = req.user.id;
    await invalidateMatchCache(userId);

    res.json({
      success: true,
      message: 'Match cache invalidated',
    });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to invalidate cache',
    });
  }
});

/**
 * @route   GET /api/matches/suggested-times/:tutorId
 * @desc    Get suggested times for booking with a specific tutor
 * @access  Private
 */
router.get('/suggested-times/:tutorId', async (req, res) => {
  try {
    const { tutorId } = req.params;
    const learnerId = req.user.id;
    const { daysAhead = 7 } = req.query;

    const { suggestSlots } = require('../services/schedulingService');
    const suggestedSlots = await suggestSlots(
      parseInt(tutorId),
      learnerId,
      parseInt(daysAhead)
    );

    res.json({
      success: true,
      count: suggestedSlots.length,
      slots: suggestedSlots,
    });
  } catch (error) {
    console.error('Error getting suggested times:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get suggested times',
    });
  }
});

module.exports = router;
