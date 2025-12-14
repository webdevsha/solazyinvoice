# Lazy Invoice 🦥

AI-Powered Invoice Generator for Zoom Meetings

## Overview

Lazy Invoice is a static web application that transforms your Zoom meeting CSV files into beautiful, professional invoices. Perfect for tutors, consultants, and freelancers who bill by the hour.

## Features

- **CSV Upload**: Drag and drop your Zoom meeting report CSV file
- **Smart Parsing**: Automatically extracts meeting sessions and calculates billing
- **Configurable Settings**: Set hourly rate, minimum billable duration, discount, and tax
- **Multiple Clients**: Generate invoices for multiple clients from a single CSV
- **Professional PDF Output**: Blue-header invoice design with payment terms
- **Amounts Rounded**: All totals rounded to the nearest Ringgit (MYR)
- **3-Day Payment Terms**: Net 3 days payment due date

## File Structure

```
solazyinvoice/
├── index.html      # Main HTML file
├── style.css       # Styling with pastel theme
├── script.js       # Invoice generation logic
├── assets/         # Images and assets folder
└── README.md       # This file
```

## How to Use

1. **Open** `index.html` in your web browser
2. **Configure** your billing settings (hourly rate, minimum duration, etc.)
3. **Upload** your Zoom meeting CSV file
4. **Review** the extracted sessions and clients
5. **Generate** and download professional PDF invoices

## CSV Format

The application expects a Zoom meeting report CSV with the following columns:
- `Topic` - Meeting name (used as client name)
- `Start time` - Meeting start time (MM/DD/YYYY hh:mm:ss A format)
- `End time` - Meeting end time (MM/DD/YYYY hh:mm:ss A format)

## Deployment on GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings** → **Pages**
3. Select **Deploy from a branch**
4. Choose the branch containing these files
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
