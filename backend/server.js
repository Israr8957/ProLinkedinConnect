//https://prezi.com/view/uXpMwTVapxhLFejDJ5Z1/
//Remove-Item -Recurse -Force .next

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";

import postsRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.static("uploads"));
app.use(postsRoutes);
app.use(userRoutes);

const port = process.env.PORT || 9090;

app.get("/test", (req, res) => {
  res.send("testing route");
});

const start = async () => {
  await mongoose
    .connect(process.env.mongodbURI)
    .then((res) => {
      console.log("database Connected");
    })
    .catch((err) => console.log("error to cionnect db", err));

  app.listen(port, () => {
    console.log("Listening on port 9090");
  });
};

start();
