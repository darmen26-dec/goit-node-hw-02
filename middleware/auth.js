const jwt = require('jsonwebtoken');
const { User } = require('../schemas/users.schema');
require('dotenv').config();

const checkAuthorization = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Authorization header missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    const verify = jwt.verify(token, process.env.JWT_SECRET);
    const userId = verify.id;
    const user = await User.findOne({ _id: userId });

    if (!user || user.token !== token) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized' });
  }
};

module.exports = checkAuthorization;
