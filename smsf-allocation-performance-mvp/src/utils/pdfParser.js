/**
 * PDF Text Extraction Utility
 * Uses pdfjs-dist for local, offline PDF text extraction
 * NO OCR - extracts embedded text only
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
// Using the bundled worker from pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Extract all text from a PDF file
 * @param {File|ArrayBuffer} input - PDF file or ArrayBuffer
 * @returns {Promise<{pages: Array<{pageNumber: number, lines: string[], rawText: string}>, fullText: string}>}
 */
export async function extractTextFromPDF(input) {
  try {
    // Convert File to ArrayBuffer if needed
    let arrayBuffer;
    if (input instanceof File) {
      arrayBuffer = await input.arrayBuffer();
    } else if (input instanceof ArrayBuffer) {
      arrayBuffer = input;
    } else {
      throw new Error('Input must be a File or ArrayBuffer');
    }

    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const pages = [];
    let fullText = '';

    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Extract text items with position information
      const textItems = textContent.items
        .filter(item => item.str && item.str.trim())
        .map(item => ({
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
          width: item.width,
          height: item.height,
        }));

      // Sort by Y position (top to bottom), then X position (left to right)
      // PDF coordinates have Y=0 at bottom, so we reverse Y sort
      textItems.sort((a, b) => {
        const yDiff = b.y - a.y;
        if (Math.abs(yDiff) > 5) return yDiff; // Same line threshold
        return a.x - b.x;
      });

      // Group items into lines based on Y position
      const lines = [];
      let currentLine = [];
      let lastY = null;

      for (const item of textItems) {
        // Check if this item is on a new line (Y difference > threshold)
        if (lastY !== null && Math.abs(lastY - item.y) > 5) {
          if (currentLine.length > 0) {
            lines.push(currentLine.map(i => i.text).join(' '));
          }
          currentLine = [];
        }
        currentLine.push(item);
        lastY = item.y;
      }

      // Don't forget the last line
      if (currentLine.length > 0) {
        lines.push(currentLine.map(i => i.text).join(' '));
      }

      const pageText = lines.join('\n');
      
      pages.push({
        pageNumber: pageNum,
        lines,
        rawText: pageText,
      });

      fullText += pageText + '\n\n';
    }

    return {
      pages,
      fullText: fullText.trim(),
      numPages: pdf.numPages,
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Extract text from a specific section of a PDF page
 * Uses text patterns to identify section boundaries
 * @param {string[]} lines - Array of text lines
 * @param {string} startPattern - Pattern marking section start
 * @param {string} endPattern - Pattern marking section end (optional)
 * @returns {string[]} Lines within the section
 */
export function extractSection(lines, startPattern, endPattern = null) {
  const startRegex = new RegExp(startPattern, 'i');
  const endRegex = endPattern ? new RegExp(endPattern, 'i') : null;
  
  let inSection = false;
  const sectionLines = [];
  
  for (const line of lines) {
    if (!inSection && startRegex.test(line)) {
      inSection = true;
      sectionLines.push(line);
      continue;
    }
    
    if (inSection) {
      if (endRegex && endRegex.test(line)) {
        sectionLines.push(line);
        break;
      }
      sectionLines.push(line);
    }
  }
  
  return sectionLines;
}

/**
 * Find a value following a label in the text
 * @param {string[]} lines - Array of text lines
 * @param {string} labelPattern - Pattern to match the label
 * @returns {string|null} The value found, or null
 */
export function findValueAfterLabel(lines, labelPattern) {
  const regex = new RegExp(labelPattern, 'i');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (regex.test(line)) {
      // Try to extract value from the same line first
      const match = line.match(new RegExp(labelPattern + '\\s*[:\\s]?\\s*([\\d,.$()-]+)', 'i'));
      if (match) {
        return match[1].trim();
      }
      
      // Check if value might be on the next line
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (/^[\d,.$()-]+$/.test(nextLine)) {
          return nextLine;
        }
      }
    }
  }
  
  return null;
}

/**
 * Extract a table from text lines
 * Assumes table has consistent column structure
 * @param {string[]} lines - Array of text lines
 * @param {string[]} headerPatterns - Patterns to identify header row
 * @returns {Array<Object>} Array of row objects
 */
export function extractTable(lines, headerPatterns) {
  // Find header row
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const matchCount = headerPatterns.filter(p => line.includes(p.toLowerCase())).length;
    if (matchCount >= Math.ceil(headerPatterns.length / 2)) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) return [];
  
  // Parse header to get column names
  const headerLine = lines[headerIndex];
  const headers = headerLine.split(/\s{2,}/).map(h => h.trim()).filter(Boolean);
  
  // Parse data rows
  const rows = [];
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Stop at end of table (usually marked by empty line or new section)
    if (/^[A-Z][a-z]+\s+[A-Z]/.test(line) && !line.includes('$')) {
      break;
    }
    
    // Split line into columns
    const values = line.split(/\s{2,}/).map(v => v.trim()).filter(Boolean);
    
    if (values.length >= 2) {
      rows.push(values);
    }
  }
  
  return { headers, rows };
}