const mongoose = require("mongoose");

// Theater schema
const theaterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  movies: [
    {
      movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
      },
      tickets: {
        type: Number,
        ref: "Ticket",
      },
    },
  ],
});

// Movie schema
const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  releaseDate: Date,
  duration: Number,
});

// Show schema
const showSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
  },
  theater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Theater",
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
});

// Ticket schema
const ticketSchema = new mongoose.Schema({
  show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Show",
    required: true,
  },
  theater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Theater",
    required: true,
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  tickets: {
    type: Number,
    required: true,
  },
  seatNumber: {
    type: Number,
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
});

const Theater = mongoose.model("Theater", theaterSchema);
const Movie = mongoose.model("Movie", movieSchema);
const Show = mongoose.model("Show", showSchema);
const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = { Theater, Movie, Show, Ticket };
