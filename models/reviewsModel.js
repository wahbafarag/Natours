const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Tour = require('./tourModel');

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, 'Review is required and can not be empty '],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a Tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a User'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// avoid duplicate reviews (two reviews from the same user on the same tour)
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Schema Statics are methods that can be invoked directly by a Model (unlike Schema Methods,
// which need to be invoked by an instance of a Mongoose document). You assign a Static to a schema by adding
// the function to the schema's statics object.

reviewSchema.statics.calcAverageRating = async function (tourId) {
  // AGGREGATION PIPELINING , this point to the current model
  const reviewStats = await this.aggregate([
    {
      // stage 1
      $match: { tour: tourId }, // select reviews belong to this tour
    },
    {
      // stage 2
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (reviewStats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: reviewStats[0].nRatings,
      ratingsAverage: reviewStats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
  // console.log(reviewStats);
};

reviewSchema.post('save', function () {
  // constructor refers to the model, use constructor cause model Review has not defined yet
  this.constructor.calcAverageRating(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.rev = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.rev.constructor.calcAverageRating(this.rev.tour); // to get tour id
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
