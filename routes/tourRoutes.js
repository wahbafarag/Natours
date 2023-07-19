const express = require('express');
const tourControllers = require('../controllers/tourControllers');
const authControllers = require('../controllers/authControllers');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top5cheap')
  .get(tourControllers.aliasTopTour, tourControllers.getAllTours);

router.route('/tour-stats').get(tourControllers.tourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authControllers.protectRoutes,
    authControllers.restrictTo('admin', 'lead-guide', 'guide'),
    tourControllers.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourControllers.getTourWithin);

router.route('/distances/:latlng/unit/:unit').get(tourControllers.getDistances);

router
  .route('/')
  .get(tourControllers.getAllTours)
  .post(
    authControllers.protectRoutes,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourControllers.createTour
  );

router
  .route('/:id')
  .get(tourControllers.getTour)
  .patch(
    authControllers.protectRoutes,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourControllers.uploadTourImages,
    tourControllers.resizeTourImages,
    tourControllers.updateTour
  )
  .delete(
    authControllers.protectRoutes,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourControllers.deleteTour
  );

module.exports = router;

// this middleware will run only for Tour routes
// works on id only and takes 4 params
// router.param('id', tourControllers.checkID);

//

// nested routes (istead of using queries and manually doing it)
// - POST /tour/tourId/reviews
// - Get /tour/tourId/reviews/reviewID
// - GET /tour/tourId/reviews

// router
//   .route('/:tourId/reviews')
//   .post(
//     protectRoutes,
//     authControllers.restrictTo('user'),
//     reviewControllers.createReview
//   );
