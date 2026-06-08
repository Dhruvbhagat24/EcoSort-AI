const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {
    res.json({
        message: "Chatbot Route Working"
    });
});

module.exports = router;