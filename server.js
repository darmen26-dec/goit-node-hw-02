const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

const DB_URL = process.env.DB_HOST;

const db = mongoose.connect(DB_URL);

db.then(() => {
  app.listen(3000, () => {
    console.log('Server running. Use our API on port: 3000');
  });
  console.log('Database connection successful');
}).catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
