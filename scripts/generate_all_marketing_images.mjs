import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const cargoDir = path.resolve("CargoPulse/marketing");
const auraDir = path.resolve("AuraPOS/marketing");

fs.mkdirSync(cargoDir, { recursive: true });
fs.mkdirSync(auraDir, { recursive: true });

function getHtmlTemplate({
  brandName,
  tagline,
  headline,
  subtitle,
  themeColor,
  accentColor,
  bgGradient,
  mockupTitle,
  mockupDetails,
  badges,
  isCargo
}) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1700px;
      height: 970px;
      font-family: 'Cairo', sans-serif;
      background: ${bgGradient};
      color: #FFFFFF;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 80px;
      position: relative;
    }
    .grid-lines {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
    }
    .glow-circle {
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: ${accentColor};
      filter: blur(140px);
      opacity: 0.18;
      top: -100px;
      left: 100px;
      pointer-events: none;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-badge {
      width: 56px;
      height: 56px;
      background: ${accentColor};
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 900;
      color: #FFFFFF;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .brand-title {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .brand-tagline {
      font-size: 16px;
      color: #94A3B8;
      font-weight: 600;
    }
    .top-pill {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 30px;
      padding: 8px 24px;
      font-size: 15px;
      font-weight: 700;
      color: ${accentColor};
    }
    main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 60px;
      position: relative;
      z-index: 10;
      flex: 1;
      margin: 30px 0;
    }
    .text-column {
      flex: 1.1;
    }
    .headline {
      font-size: 58px;
      font-weight: 900;
      line-height: 1.15;
      margin-bottom: 20px;
      background: linear-gradient(180deg, #FFFFFF 30%, #CBD5E1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      font-size: 24px;
      font-weight: 600;
      color: #94A3B8;
      line-height: 1.5;
      margin-bottom: 36px;
    }
    .badges-row {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
    }
    .feature-badge {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      padding: 10px 20px;
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .feature-badge .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: ${accentColor};
    }
    .mockup-column {
      flex: 1;
      display: flex;
      justify-content: center;
    }
    .mockup-card {
      width: 580px;
      background: #111827;
      border: 2px solid rgba(255,255,255,0.12);
      border-radius: 24px;
      box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.4);
      padding: 28px;
      position: relative;
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 20px;
      font-weight: 800;
      color: ${accentColor};
    }
    .card-status {
      font-size: 12px;
      background: rgba(16,185,129,0.15);
      color: #10B981;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: bold;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .metric-box {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px;
      padding: 14px;
    }
    .metric-label { font-size: 12px; color: #94A3B8; }
    .metric-value { font-size: 24px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: #FFFFFF; margin-top: 4px; }
    .table-sim {
      background: rgba(0,0,0,0.3);
      border-radius: 12px;
      padding: 12px;
      font-size: 13px;
    }
    .table-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
      border-top: 1px solid rgba(255,255,255,0.08);
      padding-top: 20px;
      font-size: 15px;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="grid-lines"></div>
  <div class="glow-circle"></div>

  <header>
    <div class="brand-logo">
      <div class="logo-badge">${isCargo ? '📦' : '⚡'}</div>
      <div>
        <div class="brand-title">${brandName}</div>
        <div class="brand-tagline">${tagline}</div>
      </div>
    </div>
    <div class="top-pill">تطبيق موبايل أصلي • سحابي متكامل</div>
  </header>

  <main>
    <div class="text-column">
      <h1 class="headline">${headline}</h1>
      <p class="subtitle">${subtitle}</p>
      <div class="badges-row">
        ${badges.map(b => `<div class="feature-badge"><div class="dot"></div>${b}</div>`).join('')}
      </div>
    </div>

    <div class="mockup-column">
      <div class="mockup-card">
        <div class="card-top">
          <div class="card-title">${mockupTitle}</div>
          <div class="card-status">متصل ونشط • LIVE</div>
        </div>
        <div class="metric-grid">
          ${mockupDetails.metrics.map(m => `
            <div class="metric-box">
              <div class="metric-label">${m.label}</div>
              <div class="metric-value">${m.value}</div>
            </div>
          `).join('')}
        </div>
        <div class="table-sim">
          ${mockupDetails.rows.map(r => `
            <div class="table-row">
              <span style="color:#94A3B8;">${r.col1}</span>
              <span style="font-weight:700; color:${accentColor}; font-family:'JetBrains Mono';">${r.col2}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </main>

  <footer>
    <div>دعم ثنائي كامل: العربية (RTL) • الإنجليزية (LTR)</div>
    <div>متوافق مع أجهزة البلوتوث والماسحات والطابعات الحرارية</div>
  </footer>
</body>
</html>`;
}

const CARGO_CONFIGS = [
  {
    file: 'cargopulse-01-cover',
    headline: 'إدارة لوجستية ذكية',
    subtitle: 'منصة متكاملة لإدارة الشحن والمخازن والتوصيل الميداني',
    mockupTitle: 'مركز الرياض اللوجستي (RUH-HUB-01)',
    badges: ['تتبع مسار GPS بالخلفية', 'طباعة بوالص ZPL بلوتوث', 'إثبات التسليم الرقمي POD'],
    mockupDetails: {
      metrics: [
        { label: 'الشحنات النشطة', value: '1,428' },
        { label: 'خرج للتوصيل', value: '312' }
      ],
      rows: [
        { col1: 'شحنة CP-882190-SA (جدة)', col2: 'SAR 650.00 COD' },
        { col1: 'شحنة CP-441029-SA (الرياض)', col2: 'تم التسليم ✓' }
      ]
    }
  },
  {
    file: 'cargopulse-02-warehouse',
    headline: 'إدارة المخازن والمخزون',
    subtitle: 'تحكم كامل في الشحنات والمواقع والرفوف وحركة المخزون',
    mockupTitle: 'نظام إدارة الأرفف والفرز (WMS)',
    badges: ['ماسح باركود ليزري', 'تحديد مسارات الرفوف Bins', 'أذونات صرف واستلام'],
    mockupDetails: {
      metrics: [
        { label: 'المواقع المشغولة', value: '88.4%' },
        { label: 'أوامر الفرز المنجزة', value: '450' }
      ],
      rows: [
        { col1: 'الرف A-01-01 (إلكترونيات)', col2: 'ممتلئ' },
        { col1: 'الرف B-02-04 (فلاتر شاحنات)', col2: 'شاغر' }
      ]
    }
  },
  {
    file: 'cargopulse-03-tracking',
    headline: 'تتبع الشحنات لحظياً',
    subtitle: 'تابع مسار الشحنات ومراحل التوصيل والمناديب في الوقت الفعلي',
    mockupTitle: 'رادار الأسطول وسجلات الحركة الحية',
    badges: ['تحديثات عبر SignalR', 'سجل أحداث الشحنة الكامل', 'إحداثيات جغرافية دقيقة'],
    mockupDetails: {
      metrics: [
        { label: 'السائقين النشطين', value: '28' },
        { label: 'متوسط زمن التسليم', value: '32 دقيقة' }
      ],
      rows: [
        { col1: 'الشاحنة #14 (طريق مكة السريع)', col2: 'سرعة 85 كم/س' },
        { col1: 'فان #09 (حي الروضة جدة)', col2: 'عند العميل' }
      ]
    }
  },
  {
    file: 'cargopulse-04-hardware',
    headline: 'تكامل مع الأجهزة الميدانية',
    subtitle: 'الماسحات الضوئية وطابعات البوالص المحمولة المتوافقة',
    mockupTitle: 'مركز إدارة أجهزة البلوتوث والـ OTG',
    badges: ['طابعات Zebra ZPL المحمولة', 'قارئات Honeywell الليزرية', 'دعم Offline بدون إنترنت'],
    mockupDetails: {
      metrics: [
        { label: 'طابعة ZQ521 بلوتوث', value: 'متصلة' },
        { label: 'ماسح الليزر DataWedge', value: 'جاهز' }
      ],
      rows: [
        { col1: 'بوليصة 4x6 إنش حرارية', col2: 'جاهز للطباعة' },
        { col1: 'مخزن العمليات غير المتصلة', col2: '0 معلق' }
      ]
    }
  },
  {
    file: 'cargopulse-05-dashboard',
    headline: 'لوحة تحكم متكاملة',
    subtitle: 'تابع أداء العمليات والشحنات والتحصيلات النقدية بدقة',
    mockupTitle: 'المؤشرات المالية والتشغيلية اليومية',
    badges: ['مطابقة التحصيل COD بنسبة 100%', 'تقارير أداء المناديب', 'عزل تام للشركات Multi-Tenant'],
    mockupDetails: {
      metrics: [
        { label: 'إجمالي التحصيل النقدي', value: 'SAR 42,850' },
        { label: 'نسبة الإنجاز اليومي', value: '98.4%' }
      ],
      rows: [
        { col1: 'تسوية المندوب سامي العتيبي', col2: 'مطابقة تامة' },
        { col1: 'فروقات نقدية معلقة', col2: 'SAR 0.00' }
      ]
    }
  }
];

const AURA_CONFIGS = [
  {
    file: 'aurapos-01-cover',
    headline: 'نظام نقاط بيع وإدارة متكامل',
    subtitle: 'إدارة المبيعات والمخزون والفروع المتعددة من منصة سحابية واحدة',
    mockupTitle: 'نقطة بيع أورا - فرع الرياض التحلية',
    badges: ['دعم شاشات التابلت والموبايل', 'فوترة ZATCA المعتمدة', 'فتح درج النقود RJ11'],
    mockupDetails: {
      metrics: [
        { label: 'مبيعات الوردية', value: 'SAR 8,940' },
        { label: 'الفواتير المصدرة', value: '184' }
      ],
      rows: [
        { col1: 'قهوة V60 إثيوبية + كرواسون', col2: 'SAR 48.30' },
        { col1: 'دفع عبر مدى MadaTap', col2: 'تم بنجاح ✓' }
      ]
    }
  },
  {
    file: 'aurapos-02-checkout',
    headline: 'مبيعات أسرع وأسهل',
    subtitle: 'إدارة الفواتير السريعة والمنتجات وتعديل الطلبات بلمسة واحدة',
    mockupTitle: 'واجهة الكاشير التفاعلية السريعة',
    badges: ['تقسيم الفاتورة Split Bills', 'خصومات وباقات ترويجية', 'طباعة إيصال 80mm حراري'],
    mockupDetails: {
      metrics: [
        { label: 'متوسط وقت الطلب', value: '14 ثانية' },
        { label: 'طرق الدفع المفضلة', value: '92% مدى' }
      ],
      rows: [
        { col1: 'كولد برو كولومبي جيزا', col2: 'SAR 32.00' },
        { col1: 'ضريبة القيمة المضافة 15%', col2: 'SAR 4.80' }
      ]
    }
  },
  {
    file: 'aurapos-03-inventory',
    headline: 'إدارة ذكية للمخزون والفروع',
    subtitle: 'تابع المنتجات والكميات وحركة المخزون وتنبيهات النقص الفوري',
    mockupTitle: 'مستودع المنتجات متعدد الفروع',
    badges: ['تنبيهات انخفاض الكميات', 'تحويلات المخزون بين الفروع', 'مطابقة باركود المنتجات'],
    mockupDetails: {
      metrics: [
        { label: 'إجمالي الأصناف', value: '1,240' },
        { label: 'تنبيهات نقص المخزون', value: '3 أصناف' }
      ],
      rows: [
        { col1: 'بن يرقاتشيفي مختص 250جم', col2: 'متوفر 350 كيس' },
        { col1: 'كرواسون زبدة فرنسي', col2: 'منخفض (12 حبة)' }
      ]
    }
  },
  {
    file: 'aurapos-04-analytics',
    headline: 'تقارير وتحليلات المبيعات',
    subtitle: 'تابع الأداء والإيرادات وجرد الخزينة والورديات اليومية',
    mockupTitle: 'تقرير الإغلاق اليومي (Z-Report)',
    badges: ['جرد دقيق للصندوق والخزينة', 'مبيعات الكاش والشبكة', 'تصدير PDF و Excel'],
    mockupDetails: {
      metrics: [
        { label: 'رصيد الافتتاح', value: 'SAR 500.00' },
        { label: 'المبلغ الفعلي عند الجرد', value: 'SAR 1,340.00' }
      ],
      rows: [
        { col1: 'فارق الجرد والمطابقة', col2: 'SAR 0.00 (تطابق تام)' },
        { col1: 'حالة الوردية', col2: 'مغلقة وموثقة' }
      ]
    }
  },
  {
    file: 'aurapos-05-hardware',
    headline: 'تكامل مع أجهزة نقاط البيع',
    subtitle: 'طابعات الفواتير والماسحات الضوئية وأدراج النقود المتوافقة',
    mockupTitle: 'الربط المباشر مع عتاد الكاشير',
    badges: ['طابعات ESC/POS عبر الشبكة والبلوتوث', 'نبضة فتح درج الكاشير RJ11', 'ماسحات الباركود USB/BT'],
    mockupDetails: {
      metrics: [
        { label: 'طابعة المطبخ الشبكية', value: 'متصلة' },
        { label: 'درج النقود الإلكتروني', value: 'نشط' }
      ],
      rows: [
        { col1: 'أمر قص الورق التلقائي', col2: 'مدعوم' },
        { col1: 'توليد باركود ZATCA QR', col2: 'فوري' }
      ]
    }
  }
];

async function main() {
  console.log('[Puppeteer] Launching browser at:', executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1700, height: 970 });

  // 1. Generate CargoPulse Images
  console.log('\n--- Generating 5 CargoPulse Marketing Images ---');
  for (const cfg of CARGO_CONFIGS) {
    const html = getHtmlTemplate({
      brandName: 'CargoPulse',
      tagline: 'Enterprise Logistics & Supply Chain',
      headline: cfg.headline,
      subtitle: cfg.subtitle,
      themeColor: '#0A1128',
      accentColor: '#FF6B00',
      bgGradient: 'radial-gradient(ellipse 140% 70% at 90% 10%, #FF6B0022 0%, transparent 60%), linear-gradient(150deg, #0A1128 0%, #060B1A 100%)',
      mockupTitle: cfg.mockupTitle,
      mockupDetails: cfg.mockupDetails,
      badges: cfg.badges,
      isCargo: true
    });

    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));
    const pngPath = path.join(cargoDir, `${cfg.file}.png`);
    const jpgPath = path.join(cargoDir, `${cfg.file}.jpg`);

    await page.screenshot({ path: pngPath, type: 'png' });
    await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 90 });
    console.log(`[Generated] ${cfg.file}.png & .jpg`);
  }

  // 2. Generate AuraPOS Images
  console.log('\n--- Generating 5 AuraPOS Marketing Images ---');
  for (const cfg of AURA_CONFIGS) {
    const html = getHtmlTemplate({
      brandName: 'AuraPOS',
      tagline: 'Cloud Point of Sale & Multi-Branch System',
      headline: cfg.headline,
      subtitle: cfg.subtitle,
      themeColor: '#0F172A',
      accentColor: '#4F46E5',
      bgGradient: 'radial-gradient(ellipse 140% 70% at 90% 10%, #4F46E533 0%, transparent 60%), radial-gradient(ellipse 100% 50% at 10% 90%, #10B98122 0%, transparent 50%), linear-gradient(150deg, #0F172A 0%, #090D16 100%)',
      mockupTitle: cfg.mockupTitle,
      mockupDetails: cfg.mockupDetails,
      badges: cfg.badges,
      isCargo: false
    });

    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));
    const pngPath = path.join(auraDir, `${cfg.file}.png`);
    const jpgPath = path.join(auraDir, `${cfg.file}.jpg`);

    await page.screenshot({ path: pngPath, type: 'png' });
    await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 90 });
    console.log(`[Generated] ${cfg.file}.png & .jpg`);
  }

  await browser.close();
  console.log('\n[Done] All 10 professional marketing images generated successfully!');
}

main().catch(err => {
  console.error('[Error]', err);
  process.exit(1);
});
