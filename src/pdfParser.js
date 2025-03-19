const fs = require('fs');
const pdf = require('pdf-parse');

/**
 * Parse PDF file and extract text content
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Text content of the PDF
 */
async function parsePDF(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: PDF file not found: ${filePath}`);
      return '';
    }
    
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    if (!dataBuffer || dataBuffer.length === 0) {
      console.error('Error: Empty PDF file');
      return '';
    }
    
    // Parse the PDF content
    const data = await pdf(dataBuffer);
    
    // Check if we got valid text content
    if (!data || !data.text) {
      console.error('Error: Could not extract text from PDF');
      return '';
    }
    
    console.log(`Successfully extracted ${data.text.length} characters from PDF`);
    
    // Return the text content
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    // Return empty string instead of throwing
    return '';
  }
}

module.exports = { parsePDF };