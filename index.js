const express = require("express");
const { Op } = require("sequelize");
const app = express();
const { Joke } = require("./db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/jokes", async (req, res, next) => {
  if (req.query) {
    try {
      const jokes = await Joke.findAll({
        where: {
          tags: {
            [Op.substring]: req.query.tags ?? "",
          },
          joke: {
            [Op.substring]: req.query.content ?? "",
          },
        },
      });
      res.send(jokes);
    } catch (error) {
      console.error(error);
      next(error);
    }
    return;
  }

  try {
    const jokes = await Joke.findAll();
    res.send(jokes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.post("/jokes", async (req, res, next) => {
  try {
    const newJoke = await Joke.create(req.body);
    res.status(201).send(newJoke);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.delete("/jokes/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingJoke = await Joke.findByPk(id);
    if (!existingJoke) {
      const error = new Error("Joke not found");
      error.status = 404;
      throw error;
    }

    await Joke.destroy({
      where: {
        id: id,
      },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.put("/jokes/:id", async (req, res, next) => {
  try {
    const { joke, tags } = req.body;
    const { id } = req.params;

    const existingJoke = await Joke.findByPk(id);
    if (!existingJoke) {
      const error = new Error("Joke not found");
      error.status = 404;
      throw error;
    }

    await Joke.update(
      { joke: joke, tags: tags },
      {
        where: {
          id: id,
        },
      }
    );
    const updatedJoke = await Joke.findByPk(id);
    res.status(201).send(updatedJoke);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
