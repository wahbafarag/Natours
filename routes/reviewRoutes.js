const express = require('express');
const reviewController = require('../controllers/reviewControllers');
const authControllers = require('../controllers/authControllers');

// to enable tour-reviews endpoint and newReview
const router = express.Router({ mergeParams: true });

// POST /tours/:tourId/reviews
// POST /reviews
// GET /tours/:tourId/reviews
// GET /reviews
// both routes will end up in this router after using mergeParams

router.use(authControllers.protectRoutes);

router
  .route('/')
  .get(reviewController.getReviews)
  .post(
    authControllers.restrictTo('user'),
    reviewController.setTourUserIDs,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authControllers.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authControllers.restrictTo('user', 'admin'),
    reviewController.updateReview
  );

module.exports = router;
