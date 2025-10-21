const crypto = require("crypto");

let stringsDB = [];

// Helper function to compute SHA-256 hash
const computeHash = (value) => {
  return crypto.createHash("sha256").update(value).digest("hex");
};

// Helper function to check palindrome (case-insensitive)
const isPalindrome = (value) => {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned === cleaned.split("").reverse().join("");
};

// ✅ POST /strings
exports.createString = (req, res) => {
  const { value } = req.body;

  if (typeof value !== "string") {
    return res.status(422).json({ error: "'value' must be a string" });
  }

  if (!value || value.trim() === "") {
    return res.status(422).json({ error: "'value' is required" });
  }

  const existing = stringsDB.find((s) => s.value === value);
  if (existing) {
    return res.status(409).json({ error: "String already exists" });
  }

  const newString = {
    value,
    length: value.length,
    isPalindrome: isPalindrome(value),
    hash: computeHash(value),
  };

  stringsDB.push(newString);
  return res.status(201).json(newString);
};

// ✅ GET /strings/:string_value
exports.getStringByValue = (req, res) => {
  const { string_value } = req.params;
  const found = stringsDB.find((s) => s.value === string_value);

  if (!found) {
    return res.status(404).json({ error: "String not found" });
  }

  return res.status(200).json(found);
};

// ✅ GET /strings
exports.getStrings = (req, res) => {
  let results = [...stringsDB];
  const { minLength, maxLength, isPalindrome } = req.query;

  if (minLength) {
    results = results.filter((s) => s.length >= parseInt(minLength));
  }

  if (maxLength) {
    results = results.filter((s) => s.length <= parseInt(maxLength));
  }

  if (isPalindrome !== undefined) {
    const boolValue = isPalindrome === "true";
    results = results.filter((s) => s.isPalindrome === boolValue);
  }

  return res.status(200).json(results);
};

// ✅ GET /strings/filter-by-natural-language
exports.filterByNaturalLanguage = (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(422).json({ error: "Query is required" });
  }

  let results = [...stringsDB];

  if (query.includes("palindrome")) {
    results = results.filter((s) => s.isPalindrome);
  } else if (query.includes("longer than")) {
    const num = parseInt(query.match(/\d+/)?.[0]);
    results = results.filter((s) => s.length > num);
  } else if (query.includes("shorter than")) {
    const num = parseInt(query.match(/\d+/)?.[0]);
    results = results.filter((s) => s.length < num);
  }

  return res.status(200).json(results);
};

// ✅ DELETE /strings/:string_value
exports.deleteString = (req, res) => {
  const { string_value } = req.params;
  const index = stringsDB.findIndex((s) => s.value === string_value);

  if (index === -1) {
    return res.status(404).json({ error: "String not found" });
  }

  stringsDB.splice(index, 1);
  return res.status(200).json({ message: "String deleted successfully" });
};
