const express = require('express');
require('dotenv').config();
const { User } = require('../../schemas/users.schema');

const checkAuthorization = require('../../middleware/auth');
const router = express.Router();
const jwt = require('jsonwebtoken');

const { login, signUp } = require('../../service/usersService');
const { loginAndSignUpSchema } = require('../../validation/validation');

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

    const user = await signUp({ email, password, subscription });
    res.status(201).json({
      user: { email: user.email, subscription: user.subscription },
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

module.exports = router;
