<div align="center">

# 🩺 MedCare

**Turn lab reports and prescriptions into clear, color-coded insights — in seconds.**

Bilingual (Arabic / English) · Works offline-first · Single file, zero build

</div>

---

## ✨ Overview

MedCare reads medical lab reports and prescriptions — pasted as text or uploaded as a photo — then extracts every result, classifies it, and explains what it may mean in plain language.

It is built **local-first**: a rule-based parser runs entirely in the browser, and an optional AI layer (Google Gemini) upgrades the analysis when available. If the AI is unreachable, rate-limited, or out of credits, the app silently falls back to the local parser. Users never see an error.

> ⚠️ **Medical disclaimer** — MedCare is an educational tool, not a medical device. It does not diagnose, and it never replaces a doctor or pharmacist.

## 🚀 Features

### 🧪 Lab reports
- **80+ lab tests** across CBC, glucose, kidney, electrolytes, liver, lipids, thyroid, vitamins, iron, cardiac, inflammation, coagulation, hormones and urine.
- Extracts **test name, value, unit and reference range**, then classifies each result as **Normal / High / Low**.
- **Age & sex-aware ranges** when the report doesn't print its own.
- **Critical-value alerts** with a pulsing banner for dangerous results.
- **Qualitative results** — urinalysis dipstick and serology (HBsAg, HCV, HIV, H. pylori, COVID-19…).
- **Calculated values** — eGFR (CKD-EPI 2021), HOMA-IR, TG/HDL ratio, LDL and non-HDL cholesterol.
- **Pattern detection** — e.g. iron-deficiency patterns, metabolic-syndrome features, liver and thyroid patterns.
- **Causes & next steps** for abnormal results, plus **5 tailored questions to ask your doctor**.

### 💊 Prescriptions
- Extracts medicine, dose, form, frequency, duration and food instructions (understands `BID`, `TID`, `q8h`, `1-0-1`, and Arabic phrases).
- **Drug-interaction checks**, duplicate-class warnings and **allergy alerts**.
- Shows which medicines may **affect your lab results**.
- **Daily schedule table** with one-tap **calendar (.ics) export**.

### 📷 Image input
- Upload or capture a photo of a report or prescription.
- Read with Gemini vision, or with on-device OCR (Tesseract.js) as a fallback.

### 🎨 Experience
- Full **RTL / LTR** support with instant language switching.
- Modern responsive UI with **animations**, dark mode, a score ring, grouped body-system view, table view and trend charts.
- **History** saved on-device with per-test trend charts.
- **PDF export**, share-sheet summary, **read-aloud** and adjustable font size.

## 🧠 How it works

```
 text / image
      │
      ▼
┌──────────────────────┐   success   ┌──────────────────────────┐
│  Gemini (optional)   │ ──────────▶ │  Structured results + AI │
└──────────────────────┘             │  explanations & questions │
      │ fail / cooldown / no key     └──────────────────────────┘
      ▼
┌──────────────────────┐
│  Local rule parser   │ ──────────▶  Same UI, no network needed
└──────────────────────┘
```

- **Smart-analysis cooldown** protects your API credits: after 3 successful AI calls, the AI pauses for 2 → 5 → 10 → 30 → 60 minutes while the local parser keeps working.
- **Automatic retry & model fallback** on busy servers.

## 📦 Getting started

MedCare is a single `index.html` — there is nothing to install or build.

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
# just open index.html in a browser
```

### Deploy

| Platform | Steps |
|---|---|
| **GitHub Pages** | Settings → Pages → deploy from the `main` branch (root). |
| **Netlify** | Drag and drop the folder at [app.netlify.com/drop](https://app.netlify.com/drop). |
| **Any static host** | Upload `index.html`. |

### Enable the AI layer (optional)

1. Create a key in [Google AI Studio](https://aistudio.google.com/).
2. Open `index.html`, find `const KEY=""` and paste your key.

The app works fully without a key — it simply uses the local parser.

> 🔐 **Security note:** a key embedded in client-side code is visible to anyone who opens the page source. Use a dedicated key with restrictions, or route requests through a small server-side proxy for production use.

### Diagnostics

Tap the **MedCare** logo 5 times to reveal a hidden *Test connection* button that reports the HTTP status for each configured model.

## 🗂 Project structure

```
.
├── index.html   # the entire app: UI, parser, knowledge base, logic
└── README.md
```

## ⚠️ Limitations

- Reference ranges are generic adult ranges and vary between laboratories — a range printed on the report always takes priority.
- Local OCR struggles with handwriting, blurry or skewed photos. Handwritten prescriptions are unreliable; always verify medicine names and doses with a pharmacist.
- Interaction, pattern and critical-value rules are a curated subset, **not exhaustive**.
- AI-generated explanations can be wrong. They are for awareness only.
- Accounts are not supported; history lives in the browser's local storage and is not synced across devices.

## 🛣 Roadmap

- [ ] Review-and-edit step after reading an image
- [ ] Installable PWA with offline support
- [ ] Server-side proxy for safe API-key handling
- [ ] More languages
- [ ] Expanded drug and test databases

## 🤝 Contributing

Issues and pull requests are welcome. If you add tests, drugs or interaction rules, please cite a reputable clinical source in the PR description.

## 📄 License

Released under the [MIT License](LICENSE).

---

<div align="center">

**Designed By Jad Moualla**

</div>
