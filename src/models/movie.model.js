import mongoose from "mongoose";
import Category from "./category.model";

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  englishTitle: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  trailer: {
    type: String,
    required: true,
  },
  premiere: {
    type: Date,
    required: true,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    required: true,
  },
  releaseYear: {
    type: Number,
    required: true,
    // validate releaseYear to be integer, greater than 1900 and less than 2100
    validate: {
      validator: function (releaseYear) {
        return releaseYear > 1900 && releaseYear < 2100;
      },
    },
  },
  rating: {
    type: Number,
  },
  imdbId: {
    type: String,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  seasons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Season",
    },
  ],
});

// set pre save for movieSchema
movieSchema.pre("save", async function (next) {
  // update category

  console.log("categories", this.categories);
  if (this.categories) {
    this.categories.forEach(async (category) => {
      // add movie to category if not exist
      const cat = await Category.findById(category);

      if (!cat.movies.includes(this._id)) {
        cat.movies.push(this._id);
        cat.save();
      }

      console.log(cat);
    });
  }
  next();
});

// delete from category if movie is deleted
movieSchema.pre("remove", function (next) {
  // update category
  if (this.categories) {
    this.categories.forEach((category) => {
      // remove movie from category
      category.movies.pull(this._id);
    });
  }
  next();
});

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
