import express from "express";
import { MONGO_DATA_BASE } from "./index.js";
import { ObjectId } from "mongodb";

const ROUTER = express.Router();

const bookCollection = async () => {
  await MONGO_DATA_BASE.connect((error) => {
    if (error) {
      throw error;
    }
  });
  const BOOK_COLLECTION = await MONGO_DATA_BASE.db().collection("Books");
  return BOOK_COLLECTION;
};

// All books in dataBase
ROUTER.get("/", async (request, response) => {
  const DATA_BOOKS = await bookCollection();
  DATA_BOOKS.find({}).toArray((err, result) => {
    if (err) throw err;
    response.json(result);
  });
});
// get data by id book
ROUTER.get("/:id", async (request, response) => {
  const { id } = request.params;
  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch (err) {}
  const COLLECTION = await bookCollection();
  const REQUIRED_BOOK = await COLLECTION.findOne({ _id: objectId });
  if (REQUIRED_BOOK) {
    response.json(REQUIRED_BOOK);
  } else {
    response.send("This book doesn't exist!");
  }
});
// Add book into dataBase
ROUTER.post("/", async (request, response) => {
  const BODY = request.body;
  const COLLECTION = await bookCollection();
  try {
    const RESULT = await COLLECTION.insertOne(BODY);
    response.json(RESULT);
  } catch (err) {
    response.send(`System insert Error: ${err.message}`);
  }
});
// Update book details by id
ROUTER.put("/:id", async (request, responce) => {
  const { id } = request.params;
  const BODY = request.body;
  const COLLECTION = await bookCollection();
  if (COLLECTION) {
    COLLECTION.find({}).toArray(async (err, result) => {
      if (err) throw err;
      const UPDATE_BOOK = [];
      result.forEach((book) => {
        if (book._id.toString() == id) {
          const NEW_BODY = BODY;
          UPDATE_BOOK.push({ id, NEW_BODY });
        }
      });
      if (UPDATE_BOOK.length) {
        const EQUAL_ID = new ObjectId(UPDATE_BOOK[0].id);
        const BODY_REPLACE = UPDATE_BOOK[0].NEW_BODY;
        try {
          const UPDATED_STATUS = await COLLECTION.updateOne(
            { _id: EQUAL_ID },
            { $set: BODY_REPLACE },
            { upsert: true }
          );
          if (UPDATED_STATUS.acknowledged) {
            const UPDATED_BOOK = await COLLECTION.findOne({ _id: EQUAL_ID });
            responce.send(UPDATED_BOOK);
          }
        } catch (err) {
          responce.send(`System update Error: ${err.message}`);
        }
      } else {
        responce.send(`Book with id: ${id} doesn\'t exist!`);
      }
    });
  } else {
    responce.send("System Error!");
  }
});
// Delete book by id
ROUTER.delete("/:id", async (request, responce) => {
  const { id } = request.params;
  const COLLECTION = await bookCollection();
  if (COLLECTION) {
    COLLECTION.find({}).toArray(async (err, result) => {
      if (err) throw err;
      const DEFINED_BOOK_ID = [];
      result.forEach((book) => {
        if (book._id.toString() == id) {
          DEFINED_BOOK_ID.push(book._id);
        }
      });
      if (DEFINED_BOOK_ID.length) {
        const EQUAL_ID = DEFINED_BOOK_ID[0];
        try {
          const RESULT = await COLLECTION.deleteOne({ _id: EQUAL_ID });
          if (RESULT.acknowledged) {
            responce.send(RESULT);
          }
        } catch (err) {
          responce.send(`System delete Error: ${err.message}`);
        }
      } else {
        responce.send(`Book with id: ${id} doesn\'t exist!`);
      }
    });
  } else {
    responce.send("System Error!");
  }
});

export default ROUTER;