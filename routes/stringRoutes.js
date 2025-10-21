const express = require("express");
const router = express.Router();

// Import controller functions
const {
  createString,
  getString,
  getAllStrings,
  filterByNaturalLanguage,
  deleteString,
} = require("../controllers/stringController");

// Define routes
router.post("/strings", createString);
router.get("/strings/:string_value", getString);
router.get("/strings", getAllStrings);
router.get("/strings/filter-by-natural-language", filterByNaturalLanguage);
router.delete("/strings/:string_value", deleteString);

module.exports = router;
