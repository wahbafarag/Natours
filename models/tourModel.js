const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a valid name'],
      unique: true,
      trim: true,
      minLength: [10, 'Tour name must be atleast 10 characters or more'],
      maxLength: [40, 'Tour name must be less than 40 characters'],
      // validate: [validator.isAlpha, 'Tour name can only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Tour Duration is required'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour Group size is required'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour Difficulty level is required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Tour Difficulty is either : Easy or Medium or Difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be more than 1.0'],
      max: [5, 'Rating must be less than 5.0'],
      set: (value) => Math.round(value * 10) / 10, // run every time new value comes
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Tour Price is required'],
    },
    priceDiscount: {
      type: Number,
      // custom validator
      validate: {
        validator: function (discountVal) {
          // this only points to current document on new document creation
          return discountVal < this.price;
        },
        message: `Discount Value ({VALUE}) should be less than regular price`,
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour Summary is required'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Tour Description is required'],
    },
    imageCover: {
      type: String,
      required: [true, 'Image Cover is required'],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    // here we embeding so its diff than other objects i made cause the other objects is for schema type options
    // 1-
    startLocation: {
      // embedded object
      // geojson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // coordinates of the poit(latitute,langitute)
      address: String,
      description: String,
    },
    // this array is for embeded documents
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// adding indexing for one of the most accessed parts at the tour
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 }); // combined index
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // name of the field in the other model
  localField: '_id', // name of the field in the current model
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// way of embedding users into tours
// override an arrays of IDs to array of users
// this way has some draw backs as if u changed the guide role u have to change all documents manually
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// query middlewares
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// tourSchema.pre('aggregate', function (next) {
//   // console.log(this.pipeline());
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } },
//   });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
