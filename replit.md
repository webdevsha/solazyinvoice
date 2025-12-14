# Lazy Invoice - Static GitHub Pages Version

## Overview

This is a static HTML/CSS/JavaScript version of the Lazy Invoice application, converted from the original React/TypeScript fullstack application for GitHub Pages deployment.

The application generates professional invoices from Zoom meeting CSV data.

## Project Structure

```
/
├── index.html      # Main HTML file with multi-step wizard interface
├── style.css       # Pastel-themed styling (cream, peach, mint, lavender)
├── script.js       # CSV parsing, billing calculations, PDF generation
├── assets/         # Folder for images and assets
└── README.md       # Documentation and deployment instructions
```

## Design

The design matches the original application featuring:
- Organic shapes and rounded corners (border-radius: 1.5rem)
- Gradient background: cream → peach → mint
- Floating card components with backdrop blur
- Comfortaa font for headers, Inter for body text
- Pastel color palette from the original

## Key Features

1. **4-Step Wizard Flow**:
   - Settings: Configure hourly rate, minimum duration, invoice date, discount, tax
   - Upload: Drag & drop CSV file upload
   - Review: View parsed sessions grouped by client
   - Download: Preview and download PDF invoices

2. **CSV Processing**: Uses PapaParse library (CDN)
3. **PDF Generation**: Uses jsPDF library (CDN) with blue header design
4. **Date Handling**: Uses Moment.js (CDN)

## Running Locally

The project runs with a simple HTTP server on port 5000:
```bash
python3 -m http.server 5000 --bind 0.0.0.0
```

## Deployment

For GitHub Pages deployment:
1. Push all files to a GitHub repository
2. Enable GitHub Pages in repository settings
3. The site will be accessible at the GitHub Pages URL

## Original Source

Converted from: https://github.com/webdevsha/solazyinvoice
