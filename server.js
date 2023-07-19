const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
dotenv.config({ path: path.join(__dirname, 'config.env') });

const app = require('./app');

mongoose
  .connect('mongodb://localhost:27017/new-natours', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database Connected..');
  })
  .catch((err) => {
    console.log(`Connection Error : ${err}`);
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server Up and Running on port ${port}..`);
});
