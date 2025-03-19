const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extract invoice data from PDF text using OpenAI API
 * @param {string} pdfText - Text content extracted from PDF
 * @returns {Promise<Object>} - JSON object containing structured invoice data
 */
async function extractInvoiceData(pdfText) {
  try {
    if (!pdfText || pdfText.trim() === '') {
      console.error('Error: No PDF text content provided to analyze');
      return { error: 'No content to analyze', raw_text: pdfText };
    }

    console.log(`Sending ${pdfText.length} characters to OpenAI API for analysis...`);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using GPT-4o mini instead of GPT-4
      messages: [
        {
          role: "system",
          content: "You are an assistant that extracts structured data from invoice PDFs. Extract all relevant information including invoice number, date, vendor, line items, quantities, prices, subtotal, tax, and total amount. Return ONLY valid JSON with no additional text or explanation. Format your entire response as valid JSON without markdown formatting or any other text."
        },
        {
          role: "user",
          content: `Extract the invoice data from the following text content of a PDF invoice and return it as a valid JSON object: \n\n${pdfText}`
        }
      ]
      // Removed the response_format parameter as it's not supported by gpt-4o-mini
    });

    // Check if we have a valid response
    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message || !completion.choices[0].message.content) {
      console.error('Error: Received invalid response from OpenAI API');
      return { 
        error: 'Invalid API response', 
        raw_text: pdfText.substring(0, 500) + (pdfText.length > 500 ? '...' : '') 
      };
    }

    const responseContent = completion.choices[0].message.content;
    console.log('Successfully received response from OpenAI API');

    // Clean up the response to ensure it's valid JSON
    // Strip any markdown code block indicators or extra text
    let jsonContent = responseContent.trim();
    // Remove markdown code block syntax if present
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    try {
      // Try to parse the JSON response
      const parsedData = JSON.parse(jsonContent);
      return parsedData;
    } catch (parseError) {
      console.error('Error parsing JSON response from OpenAI:', parseError);
      return { 
        error: 'Failed to parse API response as JSON',
        raw_response: responseContent,
        raw_text_sample: pdfText.substring(0, 500) + (pdfText.length > 500 ? '...' : '')
      };
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    // Return an object with error information instead of throwing
    return { 
      error: `OpenAI API error: ${error.message || 'Unknown error'}`,
      raw_text_sample: pdfText ? pdfText.substring(0, 500) + (pdfText.length > 500 ? '...' : '') : 'No text content'
    };
  }
}

module.exports = { extractInvoiceData };