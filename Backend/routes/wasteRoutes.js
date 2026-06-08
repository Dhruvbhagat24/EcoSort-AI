const express = require("express");

const router = express.Router();

const protect =
require("../middleware/authMiddleware");

const upload =
require("../middleware/uploadMiddleware");

const {
  analyzeWaste,
  getHistory,
  getStats,
  getRecentScans
} =
require("../controllers/wasteController");

router.post(
  "/analyze",
  protect,
  upload.single("image"),
  analyzeWaste
);

router.get(
    "/history",
    protect,
    getHistory
);

router.get(
    "/stats",
    protect,
    getStats
);

router.get(
    "/recent",
    protect,
    getRecentScans
);

module.exports = router;