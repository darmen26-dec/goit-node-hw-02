const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

const DB_URL = process.env.DB_HOST;
const PORT = process.env.PORT;

const db = mongoose.connect(DB_URL);

db.then(() => {
  app.listen(PORT, () => {
    console.log(`Server running. Use our API on port: ${PORT}`);
  });
  console.log('Database connection successful');
}).catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
