const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extract invoice data from PDF text using OpenAI API
 * @param {string} pdfText - Text content extracted from PDF
 * @returns {Promise<Object>} - JSON object containing structured invoice data and token usage
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
          content: `You are an assistant that extracts structured data from invoice PDFs. 
Extract all relevant information and return it in the following JSON schema format:

{
  "invoice_number": "",
  "issue_date": "",
  "due_date": "",
  "currency": "",
  "vendor": {
    "name": "",
    "address": "",
    "email": "",
    "phone": "",
    "website": "",
    "tax_office": "",
    "tax_number": "",
    "vkn": "",
    "trade_registry_no": "",
    "mersis_no": ""
  },
  "customer": {
    "name": "",
    "address": "",
    "email": "",
    "phone": "",
    "tax_office": "",
    "tax_number": "",
    "trade_registry_no": "",
    "mersis_no": ""
  },
  "line_items": [
    {
      "description": "",
      "quantity": 0,
      "unit": "",
      "unit_price": 0,
      "vat_rate": "",
      "vat_amount": 0,
      "amount": 0
    }
  ],
  "subtotal": 0,
  "total_discount": 0,
  "vat_base": 0,
  "calculated_vat": 0,
  "total_vat": 0,
  "total_amount": 0,
  "amount_to_be_paid": 0,
  "payment_method": "",
  "payment_date": "",
  "shipping_date": "",
  "shipping_carrier_vkn": "",
  "shipping_carrier_name": "",
  "notes": ""
}

Always include all fields in the schema, even if they are empty. 
For fields not found in the invoice, return empty strings for text and 0 for numbers.
Return ONLY valid JSON with no additional text or explanation.`
        },
        {
          role: "user",
          content: `Extract the invoice data from the following text content of a PDF invoice and return it as a valid JSON object following the schema exactly: \n\n${pdfText}`
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

    // Extract token usage from the response
    const tokenUsage = {
      prompt_tokens: completion.usage?.prompt_tokens || 0,
      completion_tokens: completion.usage?.completion_tokens || 0,
      total_tokens: completion.usage?.total_tokens || 0
    };

    console.log('Token Usage:');
    console.log(`  Prompt tokens: ${tokenUsage.prompt_tokens}`);
    console.log(`  Completion tokens: ${tokenUsage.completion_tokens}`);
    console.log(`  Total tokens: ${tokenUsage.total_tokens}`);

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
      // Add token usage to the response
      parsedData.token_usage = tokenUsage;
      return parsedData;
    } catch (parseError) {
      console.error('Error parsing JSON response from OpenAI:', parseError);
      return { 
        error: 'Failed to parse API response as JSON',
        raw_response: responseContent,
        raw_text_sample: pdfText.substring(0, 500) + (pdfText.length > 500 ? '...' : ''),
        token_usage: tokenUsage
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