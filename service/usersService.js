const { User } = require('../schemas/users.schema');
const gravatar = require('gravatar');

const signUp = async (body) => {
  try {
    const { email, password, subscription } = body;
    const avatarURL = gravatar.url(email, {
      protocol: 'https',
      s: '250',
      default: 'robohash',
    });

    const newUser = new User({ email, password, subscription, avatarURL });
    newUser.setPassword(password);
    await newUser.save();
    return newUser;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};

const login = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};

module.exports = {
  signUp,
  login,
};
