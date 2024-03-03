const express = require('express');
require('dotenv').config();
const { User } = require('../../schemas/users.schema');

const checkAuthorization = require('../../middleware/auth');
const fileUpload = require('../../middleware/upload');
const router = express.Router();

const { login, signUp } = require('../../service/usersService');
const {
  loginAndSignUpSchema,
  emailValidationSchema,
} = require('../../validation/validation');
const sendVerificationEmail = require('../../mailgun/mailSender');

const jwt = require('jsonwebtoken');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs').promises;

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, subscription } = req.body;

    const signUpValidationResult = loginAndSignUpSchema.validate({
      email,
      password,
    });
    if (signUpValidationResult.error)
      return res
        .status(400)
        .json({ message: signUpValidationResult.error.details[0].message });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'Email in use' });

    const user = await signUp({
      email,
      password,
      subscription,
    });
    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const loginValidationResult = loginAndSignUpSchema.validate({
      email,
      password,
    });
    if (loginValidationResult.error)
      return res
        .status(400)
        .json({ message: loginValidationResult.error.details[0].message });

    const user = await login(email, password);

    if (!user)
      return res.status(401).json({ message: 'Email or password is wrong' });

    const checkPasswordValidity = user.validPassword(password);
    if (!checkPasswordValidity)
      return res.status(401).json({ message: 'Email or password is wrong' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    user.token = token;
    await user.save();
    return res.status(200).json({
      token,
      user: { email: user.email, subscription: user.subscription },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/logout', checkAuthorization, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id);
    if (!user) return res.status(401).json({ message: 'Not authorized' });

    user.token = null;
    await user.save();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get('/current', checkAuthorization, async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser)
      return res.status(401).json({ message: 'Not authorized' });

    return res.status(200).json({
      email: currentUser.email,
      subscription: currentUser.subscription,
    });
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/avatars',
  checkAuthorization,
  fileUpload.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      const { path: temporaryPath } = req.file;
      const { _id } = req.user;
      const extension = path.extname(temporaryPath);

      const newAvatarFileName = `${_id}-${Date.now()}${extension}`;
      const sourcePath = path.join(process.cwd(), 'public', 'avatars');
      const targetPath = path.join(sourcePath, newAvatarFileName);

      try {
        await fs.rename(temporaryPath, targetPath);
        const avatar = await Jimp.read(targetPath);
        await avatar.cover(250, 250).writeAsync(targetPath);
      } catch (error) {
        await fs.unlink(temporaryPath);
        return next(error);
      }
      try {
        await User.findByIdAndUpdate(_id, {
          avatarURL: `avatars/${newAvatarFileName}`,
        });
        return res
          .status(200)
          .json({ avatarURL: `avatars/${newAvatarFileName}` });
      } catch (error) {
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
);

router.get('/verify/:verificationToken', async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const user = await User.findOne({ verificationToken });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });

    return res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    next(error);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const { email } = req.body;
    const validatedEmail = emailValidationSchema.validate({ email });
    if (validatedEmail.error)
      return res
        .status(400)
        .json({ message: validatedEmail.error.details[0].message });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'missing required field email' });

    if (user.verify)
      return res
        .status(400)
        .json({ message: 'Verification has already been passed' });

    await sendVerificationEmail({
      email,
      verificationToken: user.verificationToken,
    });

    return res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
