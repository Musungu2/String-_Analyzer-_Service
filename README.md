# String-_Analyzer-_Service

## Project Overview

A REST API that analyzes strings and stores computed properties.

## Features
- POST /strings          -> Analyze & store a string
- GET  /strings          -> Get all strings (supports query filters)
- GET  /strings/:value   -> Get a specific string
- GET  /strings/filter-by-natural-language?query=...  -> Natural language filter
- DELETE /strings/:value -> Delete a string

## Install & run locally
1. clone repo
2. cd string-analyzer-service
3. npm install
4. npm run dev   # for development (requires nodemon) OR
   npm start     # to run normally
5. Server runs on http://localhost:3000

## Example requests

### Create
POST http://localhost:3000/strings
Body:
{
  "value": "madam"
}

response
'''
{
  "id": "765cc52b3dbc1bb8ec279ef9c8ec3d0f251c0c92a6ecdc1870be8f7dc7538b21",
  "value": "madam",
  "properties": {
    "length": 5,
    "is_palindrome": true,
    "unique_characters": 3,
    "word_count": 1,
    "sha256_hash": "765cc52b3dbc1bb8ec279ef9c8ec3d0f251c0c92a6ecdc1870be8f7dc7538b21",
    "character_frequency_map": {
      "m": 2,
      "a": 2,
      "d": 1
    }
  },
  "created_at": "2025-10-21T07:51:46.578Z"
}
'''

### Get all with filters
GET http://localhost:3000/strings?is_palindrome=true&min_length=5

### Natural language filter
GET http://localhost:3000/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings

### Delete
DELETE http://localhost:3000/strings/madam
