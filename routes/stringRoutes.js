const express = require("express");
const {
  createString,
  getString,
  getAllStrings,
  filterByNaturalLanguage,
  deleteString,
} = require("../controllers/stringController");

const router = express.Router();

router.post("/strings", createString);
router.get("/strings", getAllStrings);
router.get("/strings/filter-by-natural-language", filterByNaturalLanguage);
router.get("/strings/:string_value", getString);
router.delete("/strings/:string_value", deleteString);

module.exports = router;

