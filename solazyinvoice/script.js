const { jsPDF } = window.jspdf;

let currentStep = 1;
let csvData = null;
let clientSessions = {};
let generatedInvoices = [];
let selectedFile = null;

const settings = {
    hourlyRate: 50,
    minDuration: 0.25,
    invoiceDate: new Date().toISOString().split('T')[0],
    discount: 0,
    tax: 0,
    businessDetails: ''
};

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    document.getElementById('invoiceDate').value = settings.invoiceDate;

    setupEventListeners();
    updateProgressIndicator();
}

function setupEventListeners() {
    document.getElementById('hourlyRate').addEventListener('change', (e) => {
        settings.hourlyRate = parseFloat(e.target.value) || 0;
        recalculateSessions();
    });

    document.getElementById('minDuration').addEventListener('change', (e) => {
        settings.minDuration = parseFloat(e.target.value);
        recalculateSessions();
    });

    document.getElementById('invoiceDate').addEventListener('change', (e) => {
        settings.invoiceDate = e.target.value;
    });

    document.getElementById('discount').addEventListener('change', (e) => {
        settings.discount = parseFloat(e.target.value) || 0;
    });

    document.getElementById('tax').addEventListener('change', (e) => {
        settings.tax = parseFloat(e.target.value) || 0;
    });

    document.getElementById('businessDetails').addEventListener('change', (e) => {
        settings.businessDetails = e.target.value;
    });

    document.getElementById('nextToUpload').addEventListener('click', () => goToStep(2));
    document.getElementById('backToSettings').addEventListener('click', () => goToStep(1));
    document.getElementById('backToUpload').addEventListener('click', () => goToStep(2));
    document.getElementById('backToConfig').addEventListener('click', () => goToStep(3));
    document.getElementById('startOver').addEventListener('click', startOver);

    const dropZone = document.getElementById('dropZone');
    const csvFileInput = document.getElementById('csvFile');

    dropZone.addEventListener('click', () => csvFileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.endsWith('.csv')) {
            handleFileSelect(files[0]);
        }
    });

    csvFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    document.getElementById('removeFile').addEventListener('click', () => {
        selectedFile = null;
        document.getElementById('fileInfo').classList.add('hidden');
        document.getElementById('dropZone').style.display = 'block';
        document.getElementById('processFile').disabled = true;
        document.getElementById('csvFile').value = '';
    });

    document.getElementById('processFile').addEventListener('click', processCSV);
    document.getElementById('generateInvoices').addEventListener('click', generateAllInvoices);
    document.getElementById('downloadAll').addEventListener('click', downloadAllPDFs);
}

function handleFileSelect(file) {
    selectedFile = file;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').classList.remove('hidden');
    document.getElementById('dropZone').style.display = 'none';
    document.getElementById('processFile').disabled = false;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function processCSV() {
    if (!selectedFile) return;

    Papa.parse(selectedFile, {
        header: true,
        complete: function(results) {
            try {
                const sessions = [];
                const clientSet = new Set();
                let totalHours = 0;

                results.data.forEach((row) => {
                    if (!row.Topic || !row["Start time"] || !row["End time"]) {
                        return;
                    }

                    const clientName = row.Topic.trim();
                    const startTime = moment(row["Start time"], "MM/DD/YYYY hh:mm:ss A");
                    const endTime = moment(row["End time"], "MM/DD/YYYY hh:mm:ss A");

                    if (!startTime.isValid() || !endTime.isValid()) {
                        console.warn('Invalid date format in row:', row);
                        return;
                    }

                    const durationMinutes = endTime.diff(startTime, 'minutes');
                    const durationHours = durationMinutes / 60;

                    if (durationHours < settings.minDuration) {
                        return;
                    }

                    sessions.push({
                        clientName,
                        date: startTime.format('YYYY-MM-DD'),
                        startTime: startTime.format('HH:mm'),
                        endTime: endTime.format('HH:mm'),
                        durationMinutes,
                        durationHours
                    });

                    clientSet.add(clientName);
                    totalHours += durationHours;
                });

                if (sessions.length === 0) {
                    showToast('No Valid Sessions', 'No sessions found that meet the minimum duration requirement.', 'error');
                    return;
                }

                csvData = {
                    sessions,
                    totalSessions: sessions.length,
                    uniqueClients: clientSet.size,
                    totalHours
                };

                groupSessionsByClient();
                goToStep(3);

                showToast('CSV Parsed Successfully! 🎉', 
                    `Found ${sessions.length} valid sessions from ${clientSet.size} clients`, 
                    'success');

            } catch (error) {
                showToast('CSV Parsing Failed', error.message, 'error');
            }
        },
        error: function(error) {
            showToast('CSV Parsing Error', error.message, 'error');
        }
    });
}

function groupSessionsByClient() {
    clientSessions = {};

    csvData.sessions.forEach(session => {
        if (session.durationHours < settings.minDuration) {
            return;
        }

        if (!clientSessions[session.clientName]) {
            clientSessions[session.clientName] = [];
        }

        clientSessions[session.clientName].push({
            ...session,
            amount: session.durationHours * settings.hourlyRate
        });
    });

    renderClientList();
}

function recalculateSessions() {
    if (!csvData) return;
    groupSessionsByClient();
}

function renderClientList() {
    const clientListEl = document.getElementById('clientList');
    const filterFeedbackEl = document.getElementById('filterFeedback');

    const totalSessions = Object.values(clientSessions).reduce((sum, sessions) => sum + sessions.length, 0);
    const totalClients = Object.keys(clientSessions).length;

    filterFeedbackEl.textContent = `${totalSessions} sessions from ${totalClients} clients meet the ${settings.minDuration}h minimum duration`;

    let html = '';

    for (const [clientName, sessions] of Object.entries(clientSessions)) {
        const totalAmount = sessions.reduce((sum, s) => sum + s.amount, 0);
        const totalHours = sessions.reduce((sum, s) => sum + s.durationHours, 0);

        html += `
            <div class="client-card selected" data-client="${clientName}">
                <div class="client-header">
                    <span class="client-name">${clientName}</span>
                    <span class="client-amount">RM${Math.round(totalAmount)}</span>
                </div>
                <div class="client-sessions">
                    ${sessions.length} session${sessions.length > 1 ? 's' : ''} • ${totalHours.toFixed(2)} hours
                </div>
            </div>
        `;
    }

    clientListEl.innerHTML = html || '<p class="loading">No clients found</p>';
}

function generateAllInvoices() {
    generatedInvoices = [];

    for (const [clientName, allSessions] of Object.entries(clientSessions)) {
        const validSessions = allSessions.filter(session => session.durationHours >= settings.minDuration);

        if (validSessions.length === 0) {
            continue;
        }

        const subtotal = validSessions.reduce((sum, session) => sum + session.amount, 0);
        const discountAmount = subtotal * (settings.discount / 100);
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = taxableAmount * (settings.tax / 100);
        const total = Math.round(taxableAmount + taxAmount);

        const cleanClientName = clientName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 6);
        const date = new Date(settings.invoiceDate);
        const dateString = date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit'
        }).replace(/\//g, '');
        const invoiceNumber = `${cleanClientName}${dateString}`;

        generatedInvoices.push({
            clientName,
            invoiceNumber,
            invoiceDate: settings.invoiceDate,
            sessions: validSessions,
            subtotal,
            discountAmount,
            taxAmount,
            total,
            settings: { ...settings }
        });
    }

    goToStep(4);
    renderInvoiceTabs();

    showToast('Invoices Generated! 🎊', 
        `Successfully created ${generatedInvoices.length} invoices`, 
        'success');
}

function renderInvoiceTabs() {
    const tabListEl = document.getElementById('invoiceTabs');
    const tabContentEl = document.getElementById('invoicePreview');

    let tabsHtml = '';
    generatedInvoices.forEach((invoice, index) => {
        tabsHtml += `
            <button class="tab-btn ${index === 0 ? 'active' : ''}" data-index="${index}">
                ${invoice.clientName}
            </button>
        `;
    });
    tabListEl.innerHTML = tabsHtml;

    tabListEl.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabListEl.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderInvoicePreview(parseInt(e.target.dataset.index));
        });
    });

    if (generatedInvoices.length > 0) {
        renderInvoicePreview(0);
    }
}

function renderInvoicePreview(index) {
    const invoice = generatedInvoices[index];
    const tabContentEl = document.getElementById('invoicePreview');

    const dueDate = new Date(invoice.invoiceDate);
    dueDate.setDate(dueDate.getDate() + 3);

    const totalHours = invoice.sessions.reduce((sum, s) => sum + s.durationHours, 0);
    const avgRate = invoice.subtotal / totalHours;

    let sessionsHtml = '';
    invoice.sessions.forEach(session => {
        sessionsHtml += `<div class="session-detail-row">${session.date}: ${session.startTime} - ${session.endTime} (${session.durationMinutes} min)</div>`;
    });

    tabContentEl.innerHTML = `
        <div class="invoice-preview">
            <div class="invoice-header">
                <div class="invoice-title-text">INVOICE</div>
                <div class="invoice-amount-due">
                    <div class="invoice-amount-label">Amount Due (MYR)</div>
                    <div class="invoice-amount-value">RM${invoice.total}.00</div>
                </div>
            </div>
            <div class="invoice-body">
                <div class="invoice-parties">
                    <div>
                        <div class="party-label">BILL TO</div>
                        <div class="party-value">${invoice.clientName}</div>
                    </div>
                    <div class="invoice-meta">
                        <div class="invoice-meta-row"><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</div>
                        <div class="invoice-meta-row"><strong>Invoice Date:</strong> ${formatDate(invoice.invoiceDate)}</div>
                        <div class="invoice-meta-row"><strong>Payment Due:</strong> ${formatDate(dueDate)}</div>
                    </div>
                </div>

                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>ITEMS</th>
                            <th>HOURS</th>
                            <th>PRICE</th>
                            <th class="text-right">AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${invoice.clientName} Sessions</td>
                            <td>${totalHours.toFixed(2)}</td>
                            <td>RM${avgRate.toFixed(2)}</td>
                            <td class="text-right">RM${invoice.subtotal.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="session-details">
                    ${sessionsHtml}
                </div>

                <div class="invoice-totals">
                    <div class="totals-box">
                        <div class="totals-row">
                            <span>Subtotal:</span>
                            <span>RM${invoice.subtotal.toFixed(2)}</span>
                        </div>
                        ${invoice.discountAmount > 0 ? `
                            <div class="totals-row">
                                <span>Discount (${invoice.settings.discount}%):</span>
                                <span>-RM${invoice.discountAmount.toFixed(2)}</span>
                            </div>
                        ` : ''}
                        ${invoice.taxAmount > 0 ? `
                            <div class="totals-row">
                                <span>Tax (${invoice.settings.tax}%):</span>
                                <span>RM${invoice.taxAmount.toFixed(2)}</span>
                            </div>
                        ` : ''}
                        <div class="totals-row total">
                            <span>Amount Due (MYR):</span>
                            <span>RM${invoice.total}.00</span>
                        </div>
                    </div>
                </div>

                <div class="invoice-notes">
                    <div class="invoice-notes-title">Notes / Terms</div>
                    <div class="invoice-notes-text">Payment terms: Net 3 days</div>
                    ${invoice.settings.businessDetails ? `<div class="invoice-notes-text" style="white-space: pre-line; margin-top: 8px;">${invoice.settings.businessDetails}</div>` : ''}
                </div>

                <button class="btn-download-single" onclick="downloadSinglePDF(${index})">
                    📄 Download PDF
                </button>
            </div>
        </div>
    `;
}

function formatDate(dateInput) {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-GB');
}

function downloadSinglePDF(index) {
    const invoice = generatedInvoices[index];
    generatePDF(invoice);
    showToast('PDF Downloaded! 📄', `Invoice_${invoice.clientName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 10)}_${invoice.invoiceDate}.pdf`, 'success');
}

function downloadAllPDFs() {
    generatedInvoices.forEach(invoice => {
        generatePDF(invoice);
    });
    showToast('All PDFs Downloaded! 📄', `${generatedInvoices.length} invoices downloaded`, 'success');
}

function generatePDF(invoice) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const roundedTotal = Math.round(invoice.total);

    doc.setFillColor(72, 84, 166);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, 25);

    doc.setFontSize(12);
    doc.text('Amount Due (MYR)', pageWidth - 70, 18);
    doc.setFontSize(20);
    doc.text(`RM${roundedTotal}.00`, pageWidth - 70, 32);

    doc.setTextColor(0, 0, 0);

    let yPos = 65;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 20, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, 20, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Number:', pageWidth - 80, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.invoiceNumber, pageWidth - 80, 73);

    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Date:', pageWidth - 80, 83);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(invoice.invoiceDate), pageWidth - 80, 91);

    doc.setFont('helvetica', 'bold');
    doc.text('Payment Due:', pageWidth - 80, 101);
    doc.setFont('helvetica', 'normal');
    const dueDate = new Date(invoice.invoiceDate);
    dueDate.setDate(dueDate.getDate() + 3);
    doc.text(formatDate(dueDate), pageWidth - 80, 109);

    yPos = 130;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos - 5, pageWidth - 40, 12, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ITEMS', 25, yPos);
    doc.text('HOURS', 90, yPos);
    doc.text('PRICE', 130, yPos);
    doc.text('AMOUNT', 160, yPos);

    yPos += 15;
    doc.setFont('helvetica', 'normal');

    const totalHours = invoice.sessions.reduce((sum, session) => sum + session.durationHours, 0);
    const avgRate = invoice.subtotal / totalHours;

    doc.text(`${invoice.clientName} Sessions`, 25, yPos);
    doc.text(totalHours.toFixed(2), 90, yPos);
    doc.text(`RM${avgRate.toFixed(2)}`, 130, yPos);
    doc.text(`RM${invoice.subtotal.toFixed(2)}`, 160, yPos);

    yPos += 10;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    invoice.sessions.forEach((session) => {
        const sessionText = `${session.date}: ${session.startTime} - ${session.endTime} (${session.durationMinutes} min)`;
        doc.text(sessionText, 25, yPos);
        yPos += 4;
    });

    yPos += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', 130, yPos);
    doc.text(`RM${roundedTotal}.00`, 160, yPos);

    yPos += 15;
    doc.setFillColor(245, 245, 245);
    doc.rect(120, yPos - 8, 70, 12, 'F');
    doc.text('Amount Due (MYR):', 125, yPos);
    doc.text(`RM${roundedTotal}.00`, 160, yPos);

    yPos += 25;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Notes / Terms', 20, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Payment terms: Net 3 days', 20, yPos);

    if (invoice.settings.businessDetails) {
        yPos += 10;
        const businessLines = invoice.settings.businessDetails.split('\n');
        businessLines.forEach((line) => {
            doc.text(line.trim(), 20, yPos);
            yPos += 4;
        });
    }

    const cleanClientName = invoice.clientName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 10);
    const filename = `Invoice_${cleanClientName}_${invoice.invoiceDate}.pdf`;

    doc.save(filename);
}

function goToStep(step) {
    currentStep = step;

    document.querySelectorAll('.wizard-step').forEach((el, index) => {
        el.classList.remove('active');
        if (index + 1 === step) {
            el.classList.add('active');
        }
    });

    updateProgressIndicator();
}

function updateProgressIndicator() {
    document.querySelectorAll('.progress-step').forEach((el) => {
        const stepNum = parseInt(el.dataset.step);
        el.classList.remove('active', 'completed');

        if (stepNum === currentStep) {
            el.classList.add('active');
        } else if (stepNum < currentStep) {
            el.classList.add('completed');
        }
    });
}

function startOver() {
    currentStep = 1;
    csvData = null;
    clientSessions = {};
    generatedInvoices = [];
    selectedFile = null;

    document.getElementById('fileInfo').classList.add('hidden');
    document.getElementById('dropZone').style.display = 'block';
    document.getElementById('processFile').disabled = true;
    document.getElementById('csvFile').value = '';

    goToStep(1);
}

function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
