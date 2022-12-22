const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { initDB } = require("./dbConfig");
const { Theater, Show, Movie, Ticket } = require("./model");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

//dotenv config
require("dotenv").config();
// Connect to MongoDB
initDB();

// application middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//creating theaters
app.post("/theaters", async (req, res) => {
  // console.log(req)
  const theater = new Theater({
    name: req.body.name,
    location: req.body.location,
  });

  try {
    const savedTheater = await theater.save();
    res.status(201).send({ status: "success", savedTheater });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Add a new movie
app.post("/movies", async (req, res) => {
  const movie = new Movie({
    title: req.body.title,
    description: req.body.description,
    releaseDate: req.body.releaseDate,
    duration: req.body.duration,
  });

  try {
    const savedMovie = await movie.save();
    res.status(201).send({ status: "success", savedMovie });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Add a new showtime
app.post("/shows", async (req, res) => {
  console.log(req.body);
  const showData = req.body;
  const show = new Show(showData);

  try {
    const theater = await Theater.findById(req.body.theater_id);
    const movie = await Movie.findById(req.body.movie_id);

    if (!theater || !movie) {
      return res.status(404).send("Theater or movie not found");
    }
    const newShowData = await show.save();

    res.status(201).send({ status: "success", newShowData });
  } catch (error) {
    res.status(500).json({ error });
  }
});

//book ticket
app.post("/tickets", async (req, res) => {
  try {
    const theater = await Theater.findById(req.body.theaterId);
    const movie = await Movie.findById(req.body.movieId);

    if (!theater || !movie) {
      return res.status(404).send("Theater or movie not found");
    }

    // Check if there are enough tickets available for the showtime
    const showtime = theater.movies.find((m) => m.id === movie._id);
    if (showtime.tickets < req.body.tickets) {
      return res.status(400).send("Not enough tickets available");
    }

    // Reserve the tickets
    showtime.tickets -= req.body.tickets;
    theater.save();

    res.status(201).send({
      theater: theater.name,
      movie: movie.title,
      tickets: req.body.tickets,
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

// List theaters
app.get("/theaters", async (req, res) => {
  try {
    let theaters;
    if (req.query.location) {
      // Filter by location
      theaters = await Theater.find({
        location: { $regex: req.query.location, $options: "i" },
      });
    } else {
      theaters = await Theater.find();
    }
    res.send(theaters);
  } catch (err) {
    res.status(400).send(err);
  }
});

// List movies
app.get("/movies", async (req, res) => {
  try {
    let movies;
    if (req.query.name) {
      // Filter by name
      movies = await Movie.find({
        title: { $regex: req.query.name, $options: "i" },
      });
    } else {
      movies = await Movie.find();
    }
    res.send(movies);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Reschedule booking
app.put("/tickets/:id", async (req, res) => {
  try {
    // Find the existing ticket
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).send("Ticket not found");
    }

    // Find the new theater and movie
    const newTheater = await Theater.findById(req.body.theaterId);
    const newMovie = await Movie.findById(req.body.movieId);
    if (!newTheater || !newMovie) {
      return res.status(404).send("Theater or movie not found");
    }

    // Check if there are enough tickets available for the new showtime
    const newShowtime = newTheater.movies.find((m) => m.id === newMovie.id);
    if (newShowtime.tickets < ticket.tickets) {
      return res.status(400).send("Not enough tickets available");
    }
    // console.log(newShowtime)
    // Update the ticket with the new showtime
    ticket.theater = newTheater;
    ticket.movie = newMovie;
    await ticket.save();

    // Update the ticket availability for the old and new showtimes
    const oldTheater = await Theater.findById(ticket.theater);
    const oldMovie = await Movie.findById(ticket.movie);
    // console.log(oldTheater)
    // console.log(oldMovie)
    const oldShowtime = oldTheater.movies.find((m) => m.id === oldMovie.id);
    oldShowtime.tickets += ticket.tickets;
    newShowtime.tickets -= ticket.tickets;
    await oldTheater.save();
    await newTheater.save();

    res.send(ticket);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
