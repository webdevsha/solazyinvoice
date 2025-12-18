# Lazy Invoice 🦥

AI-Powered Invoice & Quotation Generator

## Overview

Lazy Invoice is a static web application suite that provides multiple ways to create professional invoices and quotations. Perfect for tutors, consultants, freelancers, and businesses who need flexible billing solutions.

## Features

### 🎯 Zoom CSV to Invoice (`index.html`)
- **CSV Upload**: Drag and drop your Zoom meeting report CSV file
- **Smart Parsing**: Automatically extracts meeting sessions and calculates billing
- **Configurable Settings**: Set hourly rate, minimum billable duration, discount, and tax
- **Multiple Clients**: Generate invoices for multiple clients from a single CSV
- **Professional PDF Output**: Blue-header invoice design with payment terms
- **Amounts Rounded**: All totals rounded to the nearest Ringgit (MYR)
- **3-Day Payment Terms**: Net 3 days payment due date

### 📊 CSV to Quotation/Invoice (`csv-to-invoice.html`) - NEW!
- **Flexible CSV Upload**: Upload any CSV file with item descriptions and prices
- **Document Type Selection**: Choose between Quotation or Invoice format
- **Customizable Templates**: Set vendor info, client details, and document numbers
- **Real-time Preview**: See your quotation/invoice update as you type
- **Professional Formatting**: Based on premium quotation design template
- **Multi-page Support**: Handles detailed item descriptions and scopes
- **PDF Download**: One-click PDF export with your branding
- **Multi-language Support**: Supports descriptions in any language (including Malay)
- **Tax & Currency Options**: Configurable currency symbol and tax rates
- **Payment Terms**: Add custom payment information and terms

## File Structure

```
solazyinvoice/
├── index.html              # Zoom CSV to Invoice tool
├── csv-to-invoice.html     # CSV to Quotation/Invoice tool (NEW)
├── style.css               # Shared styling with pastel theme
├── script.js               # Invoice generation logic
└── README.md               # This file
```

## How to Use

### Feature 1: Zoom CSV to Invoice
1. **Open** `index.html` in your web browser
2. **Configure** your billing settings (hourly rate, minimum duration, etc.)
3. **Upload** your Zoom meeting CSV file
4. **Review** the extracted sessions and clients
5. **Generate** and download professional PDF invoices

### Feature 2: CSV to Quotation/Invoice
1. **Open** `csv-to-invoice.html` in your web browser
2. **Upload** your CSV file (from any source - itemized quotes, services list, etc.)
3. **Fill in** your company and client information
4. **Choose** between Quotation or Invoice format
5. **Customize** currency, tax rate, and payment terms
6. **Preview** updates in real-time as you make changes
7. **Download** as PDF with one click

## CSV Format Examples

### Zoom CSV Format
The application expects a Zoom meeting report CSV with the following columns:
- `Topic` - Meeting name (used as client name)
- `Start time` - Meeting start time (MM/DD/YYYY hh:mm:ss A format)
- `End time` - Meeting end time (MM/DD/YYYY hh:mm:ss A format)

### Quotation CSV Format
The new quotation feature works with any CSV containing:
- `Kod` / `Code` - Item code (optional)
- `Modul & Deskripsi` / `Description` - Item description
- `Harga (RM)` / `Price` - Item price
- `Qty` / `Quantity` - Item quantity (optional)

Example: `Sebut harga Kumim - Fasa 1.csv` is compatible with this format

## Deployment on GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings** → **Pages**
3. Select **Deploy from a branch**
4. Choose the branch containing these files
5. Access both tools at:
   - `https://yourusername.github.io/solazyinvoice/index.html`
   - `https://yourusername.github.io/solazyinvoice/csv-to-invoice.html`
5. Your site will be live at `https://yourusername.github.io/repository-name/`

## Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling with pastel theme (cream, peach, mint, lavender)
- **Vanilla JavaScript** - Logic and interactivity
- **PapaParse** - CSV parsing (via CDN)
- **jsPDF** - PDF generation (via CDN)
- **Moment.js** - Date/time handling (via CDN)

## Design

The application features a whimsical, pastel-themed design with:
- Organic shapes and rounded corners
- Gradient background (cream → peach → mint)
- Floating card components
- Smooth animations and transitions
- Comfortaa and Inter fonts

## Credits

Built with 🦥 for tutors and consultants everywhere.

## License

MIT License - Feel free to use and modify as needed.
