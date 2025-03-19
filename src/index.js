const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { parsePDF } = require('./pdfParser');
const { extractInvoiceData } = require('./openaiService');

// Create outputs directory if it doesn't exist
const outputsDir = path.join(process.cwd(), 'outputs');
if (!fs.existsSync(outputsDir)) {
  fs.mkdirSync(outputsDir);
  console.log('Created outputs directory for storing results');
}

/**
 * Main function to process a PDF invoice and extract data
 * @param {string} pdfPath - Path to the PDF file
 */
async function processInvoice(pdfPath) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_api_key_here') {
      console.error('Error: OpenAI API key not configured. Please set it in the .env file.');
      process.exit(1);
    }

    console.log(`Processing invoice: ${pdfPath}`);
    
    // Parse the PDF to extract text
    console.log('Extracting text from PDF...');
    const pdfText = await parsePDF(pdfPath);
    
    if (!pdfText || pdfText.trim() === '') {
      console.error(`Error: No text content could be extracted from ${pdfPath}`);
      return;
    }
    
    // Send to OpenAI to extract structured data
    console.log('Sending to OpenAI for data extraction...');
    const invoiceData = await extractInvoiceData(pdfText);
    
    // Check if we have valid invoice data
    if (!invoiceData) {
      console.error('Error: Failed to extract invoice data, received undefined response');
      return;
    }
    
    // Save the extracted data as JSON, but now to the outputs directory
    const filename = `${path.basename(pdfPath, path.extname(pdfPath))}_data.json`;
    const outputPath = path.join(outputsDir, filename);
    
    // Ensure we have valid JSON data to write
    const jsonData = JSON.stringify(invoiceData, null, 2);
    if (!jsonData) {
      console.error('Error: Failed to stringify invoice data to JSON');
      return;
    }
    
    fs.writeFileSync(outputPath, jsonData);
    console.log(`Invoice data extracted successfully and saved to: ${outputPath}`);
    
    // Output the extracted data
    console.log('\nExtracted Invoice Data:');
    console.log(jsonData);
    
    return invoiceData;
  } catch (error) {
    console.error('Error processing invoice:', error);
    // Don't rethrow, just log the error and let the program continue
  }
}

/**
 * Process all PDF files in the invoices directory
 */
async function processInvoicesDirectory() {
  try {
    const invoicesDir = path.join(process.cwd(), 'invoices');
    
    if (!fs.existsSync(invoicesDir)) {
      console.error('Error: "invoices" directory not found. Please create it and add PDF files there.');
      return;
    }
    
    console.log(`Processing all PDFs in invoices directory: ${invoicesDir}`);
    const files = fs.readdirSync(invoicesDir);
    const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');
    
    if (pdfFiles.length === 0) {
      console.log('No PDF files found in the invoices directory.');
      return;
    }
    
    console.log(`Found ${pdfFiles.length} PDF files.`);
    
    for (const pdfFile of pdfFiles) {
      const pdfPath = path.join(invoicesDir, pdfFile);
      await processInvoice(pdfPath);
      console.log('-----------------------------------');
    }
    
    console.log('All invoices have been processed.');
  } catch (error) {
    console.error('Error processing directory:', error);
  }
}

// Main execution logic
async function main() {
  try {
    // We only process files from the invoices directory now
    await processInvoicesDirectory();
    console.log('Processing completed.');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the application
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});