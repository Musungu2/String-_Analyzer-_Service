const crypto = require("crypto");

function analyzeString(value) {
  if (typeof value !== "string") {
    throw new Error("Invalid data type: value must be a string");
  }

  const normalized = value.toLowerCase();
  const reversed = normalized.split("").reverse().join("");
  const is_palindrome = normalized === reversed;
  const length = value.length;
  const unique_characters = new Set(value).size;
  const word_count = value.trim() === "" ? 0 : value.trim().split(/\s+/).length;

  // SHA-256 hash
  const sha256_hash = crypto.createHash("sha256").update(value).digest("hex");

  // Character frequency map
  const character_frequency_map = {};
  for (const char of value) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}

module.exports = { analyzeString };
