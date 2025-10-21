// controllers/stringController.js
const { analyzeString } = require("../utils/stringUtils");

// In-memory store (replace with DB for production)
let stringsDB = [];

/**
 * Create / Analyze String
 * POST /strings
 */
exports.createString = (req, res) => {
  const { value } = req.body;

  if (value === undefined) {
    return res.status(400).json({ error: 'Missing "value" field' });
  }
  if (typeof value !== "string") {
    return res.status(422).json({ error: '"value" must be a string' });
  }

  try {
    const properties = analyzeString(value);

    // Conflict check by hash
    const exists = stringsDB.find((s) => s.id === properties.sha256_hash);
    if (exists) {
      return res.status(409).json({ error: "String already exists" });
    }

    const stringData = {
      id: properties.sha256_hash,
      value,
      properties,
      created_at: new Date().toISOString(),
    };

    stringsDB.push(stringData);
    return res.status(201).json(stringData);
  } catch (err) {
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
};

/**
 * Get Specific String
 * GET /strings/:string_value
 */
exports.getString = (req, res) => {
  const { string_value } = req.params;
  const found = stringsDB.find((s) => s.value === string_value);
  if (!found) return res.status(404).json({ error: "String not found" });
  return res.status(200).json(found);
};

/**
 * Get All Strings with Filters
 * GET /strings
 * Query params: is_palindrome, min_length, max_length, word_count, contains_character
 */
exports.getAllStrings = (req, res) => {
  try {
    const {
      is_palindrome,
      min_length,
      max_length,
      word_count,
      contains_character,
    } = req.query;

    let filtered = [...stringsDB];

    if (is_palindrome !== undefined) {
      if (is_palindrome !== "true" && is_palindrome !== "false") {
        return res.status(400).json({ error: "is_palindrome must be true or false" });
      }
      const boolVal = is_palindrome === "true";
      filtered = filtered.filter((s) => s.properties.is_palindrome === boolVal);
    }

    if (min_length !== undefined) {
      const min = parseInt(min_length, 10);
      if (Number.isNaN(min)) return res.status(400).json({ error: "min_length must be an integer" });
      filtered = filtered.filter((s) => s.properties.length >= min);
    }

    if (max_length !== undefined) {
      const max = parseInt(max_length, 10);
      if (Number.isNaN(max)) return res.status(400).json({ error: "max_length must be an integer" });
      filtered = filtered.filter((s) => s.properties.length <= max);
    }

    if (min_length !== undefined && max_length !== undefined) {
      if (parseInt(min_length, 10) > parseInt(max_length, 10)) {
        return res.status(422).json({ error: "min_length cannot be greater than max_length" });
      }
    }

    if (word_count !== undefined) {
      const wc = parseInt(word_count, 10);
      if (Number.isNaN(wc)) return res.status(400).json({ error: "word_count must be an integer" });
      filtered = filtered.filter((s) => s.properties.word_count === wc);
    }

    if (contains_character !== undefined) {
      if (typeof contains_character !== "string" || contains_character.length === 0) {
        return res.status(400).json({ error: "contains_character must be a non-empty string" });
      }
      filtered = filtered.filter((s) => s.value.includes(contains_character));
    }

    return res.status(200).json({
      data: filtered,
      count: filtered.length,
      filters_applied: req.query,
    });
  } catch (err) {
    return res.status(400).json({ error: "Invalid query parameters", detail: err.message });
  }
};

/**
 * Natural language parsing helper
 * Very simple heuristics to map example phrases to filters.
 */
function parseNaturalLanguage(query) {
  if (!query || typeof query !== "string") {
    throw { status: 400, message: "query parameter is required" };
  }

  const q = query.toLowerCase();

  const parsed = {};

  // "single word" -> word_count = 1
  if (/\bsingle word\b/.test(q) || /\bone-word\b/.test(q)) parsed.word_count = 1;

  // "palindromic" or "palindromic strings" -> is_palindrome = true
  if (/\bpalindromic\b|\bpalindrome\b/.test(q)) parsed.is_palindrome = true;

  // "strings longer than X characters" -> min_length = X+1 (e.g., longer than 10 => min_length=11)
  const longerMatch = q.match(/longer than\s+(\d+)\s+characters?/);
  if (longerMatch) {
    const num = parseInt(longerMatch[1], 10);
    parsed.min_length = num + 1;
  }

  // "strings shorter than X characters" -> max_length = X-1
  const shorterMatch = q.match(/shorter than\s+(\d+)\s+characters?/);
  if (shorterMatch) {
    const num = parseInt(shorterMatch[1], 10);
    parsed.max_length = num - 1;
  }

  // "strings containing the letter z" or "containing z" -> contains_character = 'z'
  const containsCharMatch = q.match(/containing (?:the letter )?([a-z])/);
  if (containsCharMatch) {
    parsed.contains_character = containsCharMatch[1];
  }

  // "that contain the first vowel" -> heuristic: first vowel 'a'
  if (/\bfirst vowel\b/.test(q)) {
    parsed.contains_character = "a";
  }

  // If nothing parsed, throw unable to parse
  if (Object.keys(parsed).length === 0) {
    throw { status: 400, message: "Unable to parse natural language query" };
  }

  // Validate for conflicts (example)
  if (parsed.min_length !== undefined && parsed.max_length !== undefined) {
    if (parsed.min_length > parsed.max_length) {
      throw { status: 422, message: "Parsed filters conflict (min_length > max_length)" };
    }
  }

  return parsed;
}

/**
 * GET /strings/filter-by-natural-language?query=...
 */
exports.filterByNaturalLanguage = (req, res) => {
  try {
    const { query } = req.query;
    const parsedFilters = parseNaturalLanguage(query);

    // Reuse filtering logic: build a fake req.query for getAllStrings
    const fakeReq = { query: parsedFilters };
    // apply filters here by reusing getAllStrings logic, but we will inline minimal filter
    let filtered = [...stringsDB];

    if (parsedFilters.is_palindrome !== undefined) {
      filtered = filtered.filter((s) => s.properties.is_palindrome === parsedFilters.is_palindrome);
    }
    if (parsedFilters.min_length !== undefined) {
      filtered = filtered.filter((s) => s.properties.length >= parsedFilters.min_length);
    }
    if (parsedFilters.max_length !== undefined) {
      filtered = filtered.filter((s) => s.properties.length <= parsedFilters.max_length);
    }
    if (parsedFilters.word_count !== undefined) {
      filtered = filtered.filter((s) => s.properties.word_count === parsedFilters.word_count);
    }
    if (parsedFilters.contains_character !== undefined) {
      filtered = filtered.filter((s) => s.value.includes(parsedFilters.contains_character));
    }

    return res.status(200).json({
      data: filtered,
      count: filtered.length,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters,
      },
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    return res.status(400).json({ error: "Unable to parse natural language query" });
  }
};

/**
 * Delete string
 * DELETE /strings/:string_value
 */
exports.deleteString = (req, res) => {
  const { string_value } = req.params;
  const index = stringsDB.findIndex((s) => s.value === string_value);
  if (index === -1) {
    return res.status(404).json({ error: "String not found" });
  }
  stringsDB.splice(index, 1);
  return res.status(204).send();
};
