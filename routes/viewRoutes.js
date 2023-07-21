const express = require('express');
const router = express.Router();

const authControllers = require('../controllers/authControllers');
const viewControllers = require('../controllers/viewControllers');

router.use(viewControllers.alert);

router.get('/', authControllers.isLoggedIn, viewControllers.getOverview);
router.get('/tour/:slug', authControllers.isLoggedIn, viewControllers.getTour);
router.get('/login', authControllers.isLoggedIn, viewControllers.getLoginForm);
router.get('/me', authControllers.protectRoutes, viewControllers.getAccount);
router.get(
  '/my-tours',
  authControllers.protectRoutes,
  viewControllers.getMyTours
);

router.post(
  '/submit-user-data',
  authControllers.protectRoutes,
  viewControllers.updateUserData
);

module.exports = router;
