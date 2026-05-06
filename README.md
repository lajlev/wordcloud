# Wordcloud

Interactive word cloud generator that outputs a beautiful A4 landscape composition from weighted word data.

**[Live demo](https://lajlev.github.io/wordcloud/)**

## Features

- 5 warm color palettes
- 5 serif/script typography pairings (Google Fonts)
- 5 layout algorithms (spiral, classic, playful, horizontal, starburst)
- Shuffle button for randomized arrangements
- SVG download
- Print-ready A4 landscape output

## Usage

```bash
npm start
```

This runs `node generate.js` which reads `sample-data.json` and generates `index.html`.

## Data format

```json
{
  "title": "My Word Cloud",
  "words": [
    { "word": "example", "count": 10 },
    { "word": "another", "count": 5 }
  ]
}
```

Replace `sample-data.json` with your own data and re-run `npm start`.
