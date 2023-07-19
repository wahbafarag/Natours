const express = require('express');
const bookingController = require('../controllers/bookingControllers');
const authControllers = require('../controllers/authControllers');

const router = express.Router();

router.use(authControllers.protectRoutes);

router.get(
  '/checkout-session/:tourId',
  authControllers.protectRoutes,
  bookingController.getCheckoutSession
);

router.use(authControllers.restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllMyBookings)
  .post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
