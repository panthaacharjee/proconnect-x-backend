const express = require("express");
const app = express();
const errorMiddleware = require("./backend/middlewares/error");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  fileUpload({ limits: { fieldSize: 50 * 1024 * 1024 }, useTempFiles: true })
);
// app.use(
//   cors({
//     origin: ["https://dev-community-mern.netlify.app/"],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: [
//       "Access-Control-Allow-Origin",
//       "Content-Type",
//       "Authorization",
//     ],
//   })
// );
app.use(cors());

//Route Imports
const user = require("./backend/routes/userRoute");
const post = require("./backend/routes/postRoute");
const stack = require("./backend/routes/stackRoute");
const job = require("./backend/routes/jobRoute");
const project = require("./backend/routes/projectRoute");

app.use("/api/v1", user);
app.use("/api/v1", post);
app.use("/api/v1", stack);
app.use("/api/v1", job);
app.use("/api/v1", project);

//Middleware For Errors
app.use(errorMiddleware);

module.exports = app;
