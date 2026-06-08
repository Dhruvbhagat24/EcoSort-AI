const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({
        message: "EcoSort API Running"
    });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/waste", require("./routes/wasteRoutes"));
app.use("/api/chat", require("./routes/chatbotRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});