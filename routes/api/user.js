const express = require('express');
const router = express.Router();

const UsersController = require('../../controllers/user');
const { createBodyValidator, authenticate } = require('../../middleware/middleware');
const upload = require('../../middleware/upload');
const { schemas } = require('../../models/userSchema');

router.post(
  '/register',
  createBodyValidator(schemas.schema),
  UsersController.register
);

router.post(
  '/login',
  createBodyValidator(schemas.schema),
  UsersController.login
);

router.post('/logout', authenticate, UsersController.logout);

router.get('/current', authenticate, UsersController.current);

router.patch(
  '/avatars',
  authenticate,
  upload.single('avatar'),
  UsersController.updateAvatar
);

router.get('/verify/:verificationToken', UsersController.verify);

router.get(
  '/send-verify',
  createBodyValidator(schemas.verifySchema),
  UsersController.sendVerify
);

module.exports = router;