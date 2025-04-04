const Rating = require('../models/RatingModel');

// Submit Rating and Feedback
exports.submitRating = async (req, res) => {
  const { userId, trainerId, rating, feedback } = req.body;

  try {
    const newRating = new Rating({ userId, trainerId, rating, feedback });
    await newRating.save();

    res.status(201).json({ 
        message: "Rating submitted successfully!", 
        rating: newRating,
    success: true
 });
  } catch (error) {
    next(error);
  }
};

// Get Average Rating and Feedback for a Trainer
exports.getRatings = async (req, res) => {
  const { trainerId } = req.params;

  try {
    const ratings = await Rating.find({ trainerId }).populate('userId', 'fullName');

    const totalRatings = ratings.length;
    const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings || 0;

    res.json({
      averageRating: averageRating.toFixed(1),
      totalRatings,
      feedback: ratings.map((r) => ({
        user: r.userId.fullName,
        rating: r.rating,
        feedback: r.feedback,
        date: r.createdAt
      })),
      success: true
    });

  } catch (error) {
    next(error);
  }
};
