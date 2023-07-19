const express = require('express');
const multer = require('multer');
const router = express.Router();
// images are not uploaded into the DB we upload them into the file sys and put the link in the DB
const upload = multer({
  dest: 'public/img/users',
});
const userControllers = require('../controllers/userControllers');
const authControllers = require('../controllers/authControllers');

router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);
router.get('/logout', authControllers.logout);
router.post('/forgotPassword', authControllers.forgotPassword);
router.patch('/resetPassword/:token', authControllers.resetPassword);

router.use(authControllers.protectRoutes);
// each line comes after this line is protected in result of this middleware router.use(protectRoutes)

router.patch('/updateMyPassword', authControllers.updatePassword);
router.patch(
  '/updateMe',
  userControllers.uploadUserPhoto,
  userControllers.resizeUserPhoto,
  userControllers.updateMe
); // allow user to upload photos also
router.delete('/deleteMe', userControllers.deleteMe);
router.get('/me', userControllers.getMe, userControllers.getUser);

router.use(authControllers.restrictTo('admin'));
// another middleware similar to the prev one
router
  .route('/')
  .get(userControllers.getAllUsers)
  .post(userControllers.createUser);
router
  .route('/:id')
  .get(userControllers.getUser)
  .patch(userControllers.updateUser)
  .delete(userControllers.deleteUser);

module.exports = router;
