const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const TelegramBot = require("node-telegram-bot-api");
const path = require("path");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const token = process.env.TELEGRAM_TOKEN;
const omdbApiKey = process.env.OMDB_API_KEY;
const bot = new TelegramBot(token, { polling: true });

app.use(bodyParser.json());

// static files
app.use(express.static(path.join(__dirname, "public")));

//  index.html file  path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

bot.on("message", (msg) => {
  const movieName = msg.text.trim();

  if (!movieName) {
    bot.sendMessage(msg.chat.id, "Please provide a movie name.");
    return;
  }

  const url = `http://www.omdbapi.com/?t=${encodeURIComponent(
    movieName
  )}&apikey=${omdbApiKey}`;

  request(url, (error, response, body) => {
    if (error) {
      bot.sendMessage(
        msg.chat.id,
        "An error occurred while fetching movie details."
      );
      return;
    }

    const movieData = JSON.parse(body);

    if (movieData.Response === "True") {
      bot.sendMessage(msg.chat.id, `Title: ${movieData.Title}`);
      bot.sendMessage(msg.chat.id, `Release Date: ${movieData.Released}`);
      bot.sendMessage(msg.chat.id, `Actors: ${movieData.Actors}`);
      bot.sendMessage(msg.chat.id, `IMDB Rating: ${movieData.imdbRating}`);
      bot.sendMessage(
        msg.chat.id,
        `Link: https://www.imdb.com/title/${movieData.imdbID}/`
      );
    } else {
      bot.sendMessage(msg.chat.id, "Movie not found.");
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
