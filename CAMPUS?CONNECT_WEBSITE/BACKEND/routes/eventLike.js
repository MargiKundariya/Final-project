const express = require('express');
const router = express.Router();
const EventLike = require('../models/EventLike'); // Create a model for storing likes
router.post('/', async (req, res) => {
  try {
    console.log('Session Data:', req.session); // Debugging

    const { eventId, liked } = req.body;
    const userEmail = req.session.email; // ✅ FIXED! Use `req.session.email`

    if (!userEmail) {
      console.log('User not authenticated');
      return res.status(401).json({ message: 'User not authenticated', session: req.session });
    }

    console.log(`User Email: ${userEmail}, Event ID: ${eventId}, Liked: ${liked}`);

    let likeEntry = await EventLike.findOne({ eventId, userEmail });

    if (likeEntry) {
      likeEntry.liked = liked;
    } else {
      likeEntry = new EventLike({ eventId, userEmail, liked });
    }

    await likeEntry.save();
    console.log('Like status saved successfully:', likeEntry);
    res.json({ message: 'Like status updated', data: likeEntry });

  } catch (error) {
    console.error('Error saving like:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});
router.get('/status/:eventId', async (req, res) => {
  try {
    const userEmail = req.session.email; // Ensure email is stored correctly in session
    if (!userEmail) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { eventId } = req.params;
    const likeEntry = await EventLike.findOne({ eventId, userEmail });

    res.json({ liked: likeEntry ? likeEntry.liked : false });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});



module.exports = router;
