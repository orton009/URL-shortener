import express from "express";
import { nanoid } from "nanoid";

const PORT = 8000;

const app = express();
app.use(express.json());

/**
 * Note: This is just a showcase project, so no real database is used.
 */

const StorageInterface = function () {
  this.urls = {};
  this.reverseMap = {};
  this.insertURL = (short, long) => {
    if (this.urls[short]) {
      throw "URL Already exists";
    } else {
      this.urls[short] = { url: long, visitCount: 0 };
      this.reverseMap[long] = short;
    }
  };
  this.incrementVisit = (short) => {
    if (this.urls[short]) {
      this.urls[short].visitCount++;
    }
  };
  this.fetchURL = (short) => {
    return this.urls[short];
  };
  this.fetchLongURL = (long) => {
    const id = this.reverseMap[long];
    if (id) {
      return {
        id,
        ...this.urls[id],
      };
    }
  };
};

const URLStorage = new StorageInterface();

app.post("/url", function (req, res) {
  try {
    const { url } = req.body;
    const short = URLStorage.fetchLongURL(url);
    if (short) {
      res.json({
        id: short.id,
        originalURL: short.url,
        visitCount: short.visitCount,
      });
    } else {
      // create new short URL
      const rand = nanoid(5);
      URLStorage.insertURL(rand, url);
      res.json({
        id: rand,
        originalURL: url,
        visitCount: 0,
      });
    }
  } catch (e) {
    console.log("Error in post URL ", e);
    res.status(500).end();
  }
});

app.get("/url/:id", function (req, res) {
  try {
    const { id } = req.params;
    const shortURL = URLStorage.fetchURL(id);
    if (shortURL) {
      res.json({
        id,
        visitCount: shortURL.visitCount,
        originalURL: shortURL.url,
      });
    } else {
      res.status(404).end();
    }
  } catch (e) {
    console.log("Error in /url/:id route ", e);
    res.status(500).end();
  }
});

app.post("/url/:id/visit", function (req, res) {
  try {
    const id = req.params.id;
    URLStorage.incrementVisit(id);
    const short = URLStorage.fetchURL(id);
    res.json({
      visitCount: short.visitCount,
      id,
      originalURL: short.url,
    });
  } catch (e) {
    console.log("error in /url/:id/visit route ", e);
    res.status(500).end();
  }
});

app.listen(PORT, () => {
  console.log("Server listening on PORT ", PORT);
});
