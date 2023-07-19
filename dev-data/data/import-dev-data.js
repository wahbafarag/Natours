const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../config.env') });
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewsModel');

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

// load data
const tours = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'tours.json'), 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'reviews.json'), 'utf-8')
);

// seed new real data
const realData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data loaded !');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// delete all old and unreal data

const deleteUnReal = async () => {
  try {
    await Tour.deleteMany();
  
    console.log('Old Ones deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

//node .\dev-data\data\import-dev-data.js import
//node .\dev-data\data\import-dev-data.js delete
if (process.argv[2] === 'import') {
  realData();
} else if (process.argv[2] === 'delete') {
  deleteUnReal();
}
