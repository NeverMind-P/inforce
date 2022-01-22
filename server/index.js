import express from "express";
import { MongoClient } from "mongodb";
import router from './booksRouter.js'
import bodyParser from "body-parser";
import dotenv from "dotenv"

dotenv.config()
// Standart port
const PORT = process.env.PORT ?? 8080;
const APPLICATION = express();

const DATA_BASE_URL = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_SRV}/${process.env.MONGODB_NAME}?${process.env.MONGODB_ARGS}`
const MONGO_DATA_BASE = new MongoClient(DATA_BASE_URL);

APPLICATION.use(bodyParser.urlencoded({ extended: false }));
APPLICATION.use(bodyParser.json());
APPLICATION.use("/books", router);

const startServer = async () => {
  try {
    await MONGO_DATA_BASE.connect((error) => {
      if (error) throw error
    });
    APPLICATION.listen(PORT, () => {
      console.log("Server has been started...");
    });
  } catch (err) {
    if (err) throw err;
  }
};

startServer();
export { MONGO_DATA_BASE };