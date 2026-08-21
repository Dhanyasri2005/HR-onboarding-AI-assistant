const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const DOCUMENTS_DIR = path.join(
  __dirname,
  "..",
  "documents"
);

let documentChunks = [];

function cleanText(text) {
  return text
    .replace(/\r/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createChunks(
  text,
  chunkSize = 1000,
  overlap = 150
) {
  const chunks = [];

  if (!text || !text.trim()) {
    return chunks;
  }

  let start = 0;

  while (start < text.length) {
    const end = Math.min(
      start + chunkSize,
      text.length
    );

    const chunk = text
      .slice(start, end)
      .trim();

    if (chunk.length > 50) {
      chunks.push(chunk);
    }

    if (end >= text.length) {
      break;
    }

    start = end - overlap;
  }

  return chunks;
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function calculateScore(query, text) {
  const queryWords = [
    ...new Set(tokenize(query))
  ];

  const textWords = tokenize(text);

  if (queryWords.length === 0) {
    return 0;
  }

  const textSet = new Set(textWords);

  let score = 0;

  for (const word of queryWords) {
    if (textSet.has(word)) {
      score++;
    }
  }

  return score / queryWords.length;
}

async function loadDocuments() {
  documentChunks = [];

  if (!fs.existsSync(DOCUMENTS_DIR)) {
    fs.mkdirSync(DOCUMENTS_DIR, {
      recursive: true
    });
  }

  const files = fs
    .readdirSync(DOCUMENTS_DIR)
    .filter((file) =>
      file.toLowerCase().endsWith(".pdf")
    );

  if (files.length === 0) {
    console.warn(
      "WARNING: No PDF documents found in server/documents/"
    );

    return;
  }

  for (const file of files) {
    const filePath = path.join(
      DOCUMENTS_DIR,
      file
    );

    try {
      const buffer = fs.readFileSync(
        filePath
      );

      const parser = new PDFParse({
        data: buffer
      });

      const result = await parser.getText();

      await parser.destroy();

      const text = cleanText(
        result.text
      );

      const chunks = createChunks(text);

      chunks.forEach((chunk, index) => {
        documentChunks.push({
          id: `${file}-${index + 1}`,
          source: file,
          content: chunk
        });
      });

      console.log(
        `Loaded ${file}: ${chunks.length} chunks`
      );
    } catch (error) {
      console.error(
        `Failed to read ${file}:`,
        error.message
      );
    }
  }

  console.log(
    `Total document chunks: ${documentChunks.length}`
  );
}

function searchDocuments(query, limit = 4) {
  if (
    !query ||
    documentChunks.length === 0
  ) {
    return [];
  }

  const results = documentChunks
    .map((chunk) => ({
      ...chunk,
      score: calculateScore(
        query,
        chunk.content
      )
    }))
    .filter(
      (chunk) => chunk.score > 0
    )
    .sort(
      (a, b) => b.score - a.score
    );

  return results.slice(0, limit);
}

function getSources() {
  return [
    ...new Set(
      documentChunks.map(
        (chunk) => chunk.source
      )
    )
  ];
}

module.exports = {
  loadDocuments,
  searchDocuments,
  getSources
};