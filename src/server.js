const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const identifyRoute = require("./routes/identify");

console.log("Hi");

const app = express();
app.use(express.json());

app.use("/identify", identifyRoute);

const PORT = process.env.PORT
console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log("Server running on port 3000"));
})
.catch(err => console.log(err));