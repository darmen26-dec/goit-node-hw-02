const { User } = require('../schemas/users.schema');

const signUp = async (body) => {
  try {
    const newUser = new User(body);
    newUser.setPassword(body.password);
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
