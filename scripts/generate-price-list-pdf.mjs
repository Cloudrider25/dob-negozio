import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const rootDir = process.cwd();
const dataPath = path.resolve(rootDir, 'services_with_id.csv');
const outputHtml = path.resolve(rootDir, 'public', 'listino-prezzi.html');
const outputPdf = path.resolve(rootDir, 'public', 'listino-prezzi.pdf');
const fontPath = path.resolve(rootDir, 'public', 'fonts', 'Dobfont-Regular-new_FIXEDU.ttf');
const logoPath = path.resolve(rootDir, 'public', 'brand', 'logo-black.png');

const formatCurrency = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatDuration = (value) => {
  const minutes = Number(value);
  if (!Number.isFinite(minutes)) return '';
  const rounded = Number.isInteger(minutes) ? minutes : Number(minutes.toFixed(1));
  return `${rounded} min`;
};

const parseCSV = (text) => {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell.trim());
      cell = '';
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      continue;
    }

    cell += char;
  }

  if (cell.length || row.length) {
    row.push(cell.trim());
    if (row.some((value) => value.length > 0)) rows.push(row);
  }

  return rows;
};

const buildData = () => {
  const raw = fs.readFileSync(dataPath, 'utf8');
  const rows = parseCSV(raw);
  if (rows.length < 2) return [];
  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((header) => header.trim());

  return dataRows
    .map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] ?? '';
      });
      return record;
    })
    .filter((row) => String(row.active).toLowerCase() === 'true')
    .filter((row) => row.service_name && row.price)
    .map((row) => ({
      area: row.area || 'Altro',
      objective: row.objective || 'Servizi',
      treatment: row.treatment || 'Trattamenti',
      serviceName: row.service_name,
      price: Number(row.price),
      duration: formatDuration(row.duration_minutes),
    }));
};

const groupServices = (services) => {
  const areaMap = new Map();

  services
    .sort((a, b) => {
      return (
        a.area.localeCompare(b.area) ||
        a.objective.localeCompare(b.objective) ||
        a.treatment.localeCompare(b.treatment) ||
        a.serviceName.localeCompare(b.serviceName)
      );
    })
    .forEach((service) => {
      if (!areaMap.has(service.area)) areaMap.set(service.area, new Map());
      const objectiveMap = areaMap.get(service.area);
      if (!objectiveMap.has(service.objective)) objectiveMap.set(service.objective, new Map());
      const treatmentMap = objectiveMap.get(service.objective);
      if (!treatmentMap.has(service.treatment)) treatmentMap.set(service.treatment, []);
      treatmentMap.get(service.treatment).push(service);
    });

  return areaMap;
};

const renderHtml = (areaMap) => {
  const updatedAt = new Date().toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const logoUrl = pathToFileURL(logoPath).toString();
  const fontUrl = pathToFileURL(fontPath).toString();

  const sections = Array.from(areaMap.entries())
    .map(([area, objectiveMap]) => {
      const objectives = Array.from(objectiveMap.entries())
        .map(([objective, treatmentMap]) => {
          const treatments = Array.from(treatmentMap.entries())
            .map(([treatment, services]) => {
              const rows = services
                .map((service) => {
                  const priceLabel = Number.isFinite(service.price)
                    ? formatCurrency.format(service.price)
                    : '—';
                  const durationLabel = service.duration || '—';

                  return `
                    <div class="service-row">
                      <div class="service-name">${service.serviceName}</div>
                      <div class="service-meta">${durationLabel}</div>
                      <div class="service-price">${priceLabel}</div>
                    </div>
                  `;
                })
                .join('');

              return `
                <div class="treatment">
                  <div class="treatment-title">${treatment}</div>
                  <div class="service-list">
                    ${rows}
                  </div>
                </div>
              `;
            })
            .join('');

          return `
            <div class="objective">
              <div class="objective-title">${objective}</div>
              ${treatments}
            </div>
          `;
        })
        .join('');

      return `
        <section class="area">
          <div class="area-title">${area}</div>
          ${objectives}
        </section>
      `;
    })
    .join('');

  return `
<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Listino prezzi DOB Milano</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap');

      @font-face {
        font-family: 'DOB Display';
        src: url('${fontUrl}') format('truetype');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }

      :root {
        --bg: #EDF2F2;
        --bg-2: #F5F2ED;
        --page-bg: #FFFFFF;
        --paper: #EEE;
        --sand: #E9E2D6;
        --text-primary: rgba(7, 7, 10, 0.92);
        --text-secondary: rgba(7, 7, 10, 0.7);
        --text-muted: rgba(7, 7, 10, 0.5);
        --stroke: rgba(7, 7, 10, 0.08);
        --tech-cyan: #50A4F8;
        --pearl-grad: linear-gradient(180deg, #FFFFFF 0%, #F5F2ED 60%, #F0ECE6 100%);
        --shadow-soft: 0 10px 40px rgba(0, 0, 0, 0.12);
        --radius-card: 20px;
      }

      @page {
        size: A4;
        margin: 0;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: 'Instrument Sans', 'Inter', 'Helvetica Neue', Arial, sans-serif;
        background: var(--pearl-grad);
        color: var(--text-primary);
      }

      .page {
        padding: 24mm 20mm 22mm;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        margin-bottom: 18mm;
      }

      .logo {
        width: 140px;
        height: auto;
      }

      .title-block {
        text-align: right;
      }

      .title {
        font-family: 'DOB Display', 'Times New Roman', serif;
        font-size: 28px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        margin: 0 0 6px;
      }

      .subtitle {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
      }

      .meta {
        margin-top: 6px;
        font-size: 12px;
        color: var(--text-muted);
      }

      .area {
        margin-bottom: 18mm;
        page-break-inside: avoid;
      }

      .area-title {
        font-family: 'DOB Display', 'Times New Roman', serif;
        font-size: 20px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        margin: 0 0 8mm;
      }

      .objective {
        background: rgba(255, 255, 255, 0.82);
        border: 1px solid var(--stroke);
        border-radius: var(--radius-card);
        box-shadow: var(--shadow-soft);
        padding: 16px 18px 8px;
        margin-bottom: 10mm;
        page-break-inside: avoid;
      }

      .objective-title {
        font-size: 16px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin: 0 0 12px;
        color: var(--text-secondary);
      }

      .treatment {
        margin-bottom: 12px;
        page-break-inside: avoid;
      }

      .treatment-title {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 8px;
        color: var(--text-primary);
      }

      .service-list {
        display: grid;
        gap: 8px;
      }

      .service-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 90px 120px;
        gap: 16px;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.92);
        border-radius: 14px;
        border: 1px solid rgba(7, 7, 10, 0.06);
      }

      .service-name {
        font-size: 13px;
        line-height: 1.35;
        color: var(--text-primary);
      }

      .service-meta {
        font-size: 12px;
        color: var(--text-muted);
        text-align: right;
        white-space: nowrap;
      }

      .service-price {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        text-align: right;
        white-space: nowrap;
      }

      .footer-note {
        margin-top: 12mm;
        font-size: 11px;
        color: var(--text-muted);
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <header class="header">
        <img class="logo" src="${logoUrl}" alt="DOB Milano" />
        <div class="title-block">
          <h1 class="title">Listino Prezzi</h1>
          <p class="subtitle">Light theme edition · Milano</p>
          <div class="meta">Aggiornato al ${updatedAt}</div>
        </div>
      </header>

      ${sections}

      <div class="footer-note">I prezzi sono indicativi e possono variare in base alla consulenza personalizzata.</div>
    </div>
  </body>
</html>
  `.trim();
};

const generatePdf = async () => {
  const services = buildData();
  if (!services.length) {
    throw new Error('Nessun servizio disponibile per generare il listino.');
  }

  const grouped = groupServices(services);
  const html = renderHtml(grouped);

  fs.writeFileSync(outputHtml, html, 'utf8');

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } });
  await page.goto(pathToFileURL(outputHtml).toString(), { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });

  await page.pdf({
    path: outputPdf,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();

  console.log(`PDF generato: ${outputPdf}`);
};

generatePdf().catch((error) => {
  console.error(error);
  process.exit(1);
});
