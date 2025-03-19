# PDF Invoice Extractor

A Node.js application that extracts structured data from PDF invoices using the OpenAI API.

## Overview

This tool takes PDF invoices, extracts their text content, sends it to the OpenAI API (using GPT-4o mini), and returns the invoice data as a structured JSON object. The extracted data is saved to an output directory.

## Project Structure

```
pdf-invoice-extractor/
├── invoices/            # Directory to place PDF invoices for processing
├── outputs/             # Directory where extracted JSON data is saved
├── src/                 # Source code
│   ├── index.js         # Main entry point
│   ├── openaiService.js # OpenAI API integration
│   └── pdfParser.js     # PDF parsing functionality
├── .env                 # Environment variables (OpenAI API key)
├── package.json         # Project dependencies and scripts
└── README.md            # Project documentation
```

## Setup

### Prerequisites

- Node.js (v16 or higher)
- An OpenAI API key

### Installation

1. Clone the repository or download the source code:
```
git clone https://github.com/burhanyldz/pdf-invoice-extractor.git
cd pdf-invoice-extractor
```

2. Install the dependencies:
```
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

### Directory Setup

1. Create the invoices directory (if it doesn't already exist):
```
mkdir -p invoices
```

2. The outputs directory will be created automatically when you run the application.

## Usage

1. Place your PDF invoices in the `invoices` directory.

2. Run the extraction process:
```
npm run extract
```

3. The extracted data will be saved as JSON files in the `outputs` directory:
   - Each invoice will have a corresponding JSON file (e.g., `invoice.pdf` → `invoice_data.json`)
   - A token usage summary will also be saved as `token_usage_summary.json`

## Features

- Extracts key invoice data including invoice numbers, dates, vendor information, line items, and totals
- Processes multiple PDF invoices in batch
- Saves structured data as JSON for easy integration with other systems
- Tracks and reports OpenAI API token usage for cost monitoring
- Robust error handling for PDF parsing and API communication

## Token Usage Monitoring

The application tracks OpenAI API token usage for each file and provides a summary at the end of processing. This information is also saved to `outputs/token_usage_summary.json` for your reference.

## Troubleshooting

- If you encounter "Invalid API key" errors, ensure your OpenAI API key is correctly set in the `.env` file.
- For PDF parsing issues, verify that your PDF files aren't corrupted and contain extractable text (not just images).
- If the JSON output is incomplete or inaccurate, you may need to adjust the system prompt in `openaiService.js` to better match your invoice format.