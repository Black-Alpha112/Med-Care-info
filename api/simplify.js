import supabase from './db-client.js';

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wordBoundaryMatch(text, needle, from = 0) {
  const lower = text.toLowerCase();
  const n = needle.toLowerCase();
  let start = from;
  while (start <= lower.length - n.length) {
    const idx = lower.indexOf(n, start);
    if (idx === -1) return -1;
    const end = idx + n.length;
    const beforeOk = idx === 0 || !/[A-Za-z0-9]/.test(text[idx - 1]);
    const afterOk = end >= text.length || !/[A-Za-z0-9]/.test(text[end]);
    if (beforeOk && afterOk) return idx;
    start = idx + 1;
  }
  return -1;
}

function findTerms(text, glossary) {
  const occupied = new Array(text.length).fill(false);
  const enriched = glossary.map((g) => {
    const names = [g.term, ...(g.aliases ? String(g.aliases).split(',').map((s) => s.trim()) : [])].filter(Boolean);
    return { ...g, names };
  });
  enriched.sort(
    (a, b) => Math.max(...b.names.map((n) => n.length)) - Math.max(...a.names.map((n) => n.length))
  );
  const found = [];
  for (const t of enriched) {
    let matchedName = null;
    let matchedIdx = -1;
    for (const name of t.names) {
      if (name.length < 3) continue;
      const idx = wordBoundaryMatch(text, name);
      if (idx !== -1) {
        const end = idx + name.length;
        const overlap = occupied.slice(idx, end).some(Boolean);
        if (!overlap && (matchedIdx === -1 || name.length > matchedName.length)) {
          matchedName = name;
          matchedIdx = idx;
        }
      }
    }
    if (matchedName) {
      occupied.fill(true, matchedIdx, matchedIdx + matchedName.length);
      found.push({ ...t, matched: matchedName, index: matchedIdx });
    }
  }
  found.sort((a, b) => a.index - b.index);
  return found;
}

function extractLabs(text, markers) {
  const findings = [];
  const used = new Set();
  for (const m of markers) {
    const names = [m.abbreviation, m.name].filter(Boolean);
    for (const name of names) {
      const escaped = escapeRegExp(name);
      const re = new RegExp(
        `\\b${escaped}\\b(?:\\s+(?:cholesterol|level|count|value))?\\s*[:\\-–]?\\s*([0-9]+(?:\\.[0-9]+)?)`,
        'i'
      );
      const match = text.match(re);
      if (match) {
        const value = parseFloat(match[1]);
        if (Number.isNaN(value)) continue;
        const key = m.abbreviation || m.name;
        if (used.has(key)) break;
        used.add(key);
        const low = m.low_normal == null ? null : Number(m.low_normal);
        const high = m.high_normal == null ? null : Number(m.high_normal);
        let status = 'normal';
        if (low != null && value < low) status = 'low';
        if (high != null && value > high) status = 'high';
        findings.push({
          name: m.name,
          abbreviation: m.abbreviation,
          value,
          unit: m.unit,
          status,
          low_normal: low,
          high_normal: high,
          category: m.category,
          plain_en: m.plain_en,
          plain_es: m.plain_es,
          high_meaning_en: m.high_meaning_en,
          high_meaning_es: m.high_meaning_es,
          low_meaning_en: m.low_meaning_en,
          low_meaning_es: m.low_meaning_es,
        });
        break;
      }
    }
  }
  return findings;
}

function extractMedications(text, glossary) {
  const meds = glossary.filter((g) => g.category === 'medication');
  const found = [];
  for (const med of meds) {
    const names = [med.term, ...(med.aliases ? String(med.aliases).split(',').map((s) => s.trim()) : [])].filter(Boolean);
    for (const name of names) {
      const idx = wordBoundaryMatch(text, name);
      if (idx === -1) continue;
      const window = text.slice(idx, Math.min(text.length, idx + name.length + 80));
      const dose =
        window.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|units?|iu)\b/i) ||
        window.match(/\b(81|10|40|500|875)\s*(mg)?/i);
      const freqMatch = window.match(
        /\b(once daily|twice daily|at bedtime|with meals|bid|tid|qid|prn|daily|every morning)\b/i
      );
      found.push({
        name: med.term,
        matched: name,
        dosage: dose ? `${dose[1]} ${dose[2] || 'mg'}`.trim() : null,
        frequency: freqMatch ? freqMatch[1] : null,
        purpose_en: med.plain_en,
        purpose_es: med.plain_es,
        caution_en: med.ask_doctor_en,
        caution_es: med.ask_doctor_es,
        severity: med.severity,
      });
      break;
    }
  }
  return found;
}

function detectType(text, requested, labs, meds) {
  if (requested && requested !== 'auto') return requested;
  const t = text.toLowerCase();
  if (labs.length >= 3) return 'lab';
  if (meds.length >= 2 || /\brx\b|take 1 tablet|by mouth/.test(t)) return 'prescription';
  if (/impression:|findings:|discharge|ct |radiology/.test(t)) return 'report';
  return labs.length ? 'lab' : meds.length ? 'prescription' : 'report';
}

function buildResult(text, glossary, markers, language) {
  const lang = language === 'es' ? 'es' : 'en';
  const terms = findTerms(text, glossary);
  const labs = extractLabs(text, markers);
  const medications = extractMedications(text, glossary);
  const reportType = detectType(text, null, labs, medications);

  const highLabs = labs.filter((l) => l.status === 'high');
  const lowLabs = labs.filter((l) => l.status === 'low');
  const normalLabs = labs.filter((l) => l.status === 'normal');
  const urgentTerms = terms.filter((t) => t.severity === 'urgent');
  const cautionTerms = terms.filter((t) => t.severity === 'caution');

  let overall = 'good';
  if (highLabs.length + lowLabs.length >= 1 || cautionTerms.length >= 1) overall = 'attention';
  if (urgentTerms.length >= 1 || highLabs.length + lowLabs.length >= 4) overall = 'urgent';
  if (highLabs.length + lowLabs.length === 0 && urgentTerms.length === 0 && labs.length > 0) overall = 'good';

  const pick = (row, en, es) => (lang === 'es' ? row[es] : row[en]);

  const mappedTerms = terms.map((t) => ({
    term: t.term,
    matched: t.matched,
    category: t.category,
    severity: t.severity,
    plain: pick(t, 'plain_en', 'plain_es'),
    ask_doctor: pick(t, 'ask_doctor_en', 'ask_doctor_es'),
  }));

  const mappedLabs = labs.map((l) => {
    const meaning =
      l.status === 'high'
        ? pick(l, 'high_meaning_en', 'high_meaning_es')
        : l.status === 'low'
          ? pick(l, 'low_meaning_en', 'low_meaning_es')
          : lang === 'es'
            ? 'Este valor está dentro del rango habitual.'
            : 'This value is within the usual range.';
    return {
      name: l.name,
      abbreviation: l.abbreviation,
      value: l.value,
      unit: l.unit,
      status: l.status,
      low_normal: l.low_normal,
      high_normal: l.high_normal,
      category: l.category,
      plain: pick(l, 'plain_en', 'plain_es'),
      meaning,
    };
  });

  const mappedMeds = medications.map((m) => ({
    name: m.name,
    dosage: m.dosage,
    frequency: m.frequency,
    purpose: lang === 'es' ? m.purpose_es : m.purpose_en,
    caution: lang === 'es' ? m.caution_es : m.caution_en,
  }));

  const questions = [];
  const qSet = new Set();
  const pushQ = (q) => {
    if (q && !qSet.has(q)) {
      qSet.add(q);
      questions.push(q);
    }
  };
  mappedTerms.forEach((t) => pushQ(t.ask_doctor));
  mappedLabs.forEach((l) => {
    if (l.status !== 'normal') {
      pushQ(
        lang === 'es'
          ? `¿Qué significa mi ${l.name} de ${l.value} ${l.unit || ''} y hay que repetir la prueba?`
          : `What does my ${l.name} of ${l.value} ${l.unit || ''} mean, and should we repeat the test?`
      );
    }
  });
  mappedMeds.forEach((m) => pushQ(m.caution));
  if (questions.length === 0) {
    pushQ(
      lang === 'es'
        ? '¿Hay algo en este informe que deba vigilar o cambiar en mi día a día?'
        : 'Is there anything in this report I should watch or change in daily life?'
    );
  }

  const highlights = [];
  if (highLabs.length) {
    highlights.push(
      lang === 'es'
        ? `${highLabs.length} valor${highLabs.length > 1 ? 'es' : ''} por encima del rango habitual: ${highLabs.map((l) => l.abbreviation || l.name).join(', ')}.`
        : `${highLabs.length} value${highLabs.length > 1 ? 's' : ''} above the usual range: ${highLabs.map((l) => l.abbreviation || l.name).join(', ')}.`
    );
  }
  if (lowLabs.length) {
    highlights.push(
      lang === 'es'
        ? `${lowLabs.length} valor${lowLabs.length > 1 ? 'es' : ''} por debajo del rango habitual: ${lowLabs.map((l) => l.abbreviation || l.name).join(', ')}.`
        : `${lowLabs.length} value${lowLabs.length > 1 ? 's' : ''} below the usual range: ${lowLabs.map((l) => l.abbreviation || l.name).join(', ')}.`
    );
  }
  if (normalLabs.length && labs.length) {
    highlights.push(
      lang === 'es'
        ? `${normalLabs.length} valor${normalLabs.length > 1 ? 'es' : ''} dentro de lo esperado.`
        : `${normalLabs.length} value${normalLabs.length > 1 ? 's' : ''} look as expected.`
    );
  }
  if (mappedMeds.length) {
    highlights.push(
      lang === 'es'
        ? `Se encontraron ${mappedMeds.length} medicamento${mappedMeds.length > 1 ? 's' : ''} en el texto.`
        : `${mappedMeds.length} medication${mappedMeds.length > 1 ? 's' : ''} found in this text.`
    );
  }
  if (mappedTerms.length && !highlights.length) {
    highlights.push(
      lang === 'es'
        ? `Tradujimos ${mappedTerms.length} términos clínicos a lenguaje sencillo.`
        : `We translated ${mappedTerms.length} clinical terms into everyday language.`
    );
  }

  const headline =
    overall === 'urgent'
      ? lang === 'es'
        ? 'Hay hallazgos que conviene revisar pronto con tu médico.'
        : 'Some findings are worth reviewing soon with your clinician.'
      : overall === 'attention'
        ? lang === 'es'
          ? 'Varios valores merecen una conversación — no es un diagnóstico.'
          : 'A few values deserve a conversation — this is not a diagnosis.'
        : lang === 'es'
          ? 'En conjunto, este informe se ve relativamente tranquilo.'
          : 'Overall, this report looks relatively reassuring.';

  const summaryParts = [];
  summaryParts.push(headline);
  if (mappedLabs.length) {
    const bits = mappedLabs
      .filter((l) => l.status !== 'normal')
      .map((l) => {
        const dir = l.status === 'high' ? (lang === 'es' ? 'alto' : 'high') : lang === 'es' ? 'bajo' : 'low';
        return `${l.name} (${l.value} ${l.unit || ''}) — ${dir}: ${l.meaning}`;
      });
    if (bits.length) summaryParts.push(bits.join(' '));
    else {
      summaryParts.push(
        lang === 'es'
          ? 'Los valores de laboratorio que reconocimos están dentro de los rangos habituales.'
          : 'The lab values we recognized sit within usual ranges.'
      );
    }
  }
  if (mappedMeds.length) {
    summaryParts.push(
      lang === 'es'
        ? `Medicamentos mencionados: ${mappedMeds.map((m) => m.name).join(', ')}. Cada uno tiene un propósito concreto; confirma dosis e indicación con tu equipo de salud.`
        : `Medications mentioned: ${mappedMeds.map((m) => m.name).join(', ')}. Each has a specific job; confirm dose and indication with your care team.`
    );
  }
  if (mappedTerms.length) {
    const top = mappedTerms.slice(0, 6).map((t) => `${t.term}: ${t.plain}`);
    summaryParts.push(
      lang === 'es'
        ? `En palabras sencillas — ${top.join(' ')}`
        : `In plain words — ${top.join(' ')}`
    );
  }
  if (summaryParts.length === 1) {
    summaryParts.push(
      lang === 'es'
        ? 'No reconocimos valores de laboratorio ni términos habituales. Pega el texto completo del informe (incluyendo números y unidades) para una lectura más rica.'
        : 'We did not recognize common lab values or clinical terms. Paste the full report text (including numbers and units) for a richer reading.'
    );
  }
  summaryParts.push(
    lang === 'es'
      ? 'ClearMed AI no diagnostica ni receta. Usa esta lectura para preparar preguntas, no para tomar decisiones médicas por tu cuenta.'
      : 'ClearMed AI does not diagnose or prescribe. Use this reading to prepare questions, not to make medical decisions on your own.'
  );

  const typeLabel =
    reportType === 'lab'
      ? lang === 'es'
        ? 'Análisis de laboratorio'
        : 'Lab panel'
      : reportType === 'prescription'
        ? lang === 'es'
          ? 'Receta'
          : 'Prescription'
        : lang === 'es'
          ? 'Informe clínico'
          : 'Clinical report';

  return {
    title: typeLabel,
    report_type: reportType,
    headline,
    overall,
    summary: summaryParts.join('\n\n'),
    highlights,
    terms: mappedTerms,
    labs: mappedLabs,
    medications: mappedMeds,
    questions: questions.slice(0, 6),
    language: lang,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const { text, language, report_type } = req.body || {};
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'text is required' });
    }
    if (String(text).trim().length < 12) {
      return res.status(400).json({ error: 'Please paste a longer report, prescription, or lab result.' });
    }

    const [{ data: glossary, error: gErr }, { data: markers, error: mErr }] = await Promise.all([
      supabase.from('glossary_terms').select('*'),
      supabase.from('lab_markers').select('*'),
    ]);
    if (gErr) throw gErr;
    if (mErr) throw mErr;

    const result = buildResult(String(text), glossary || [], markers || [], language === 'es' ? 'es' : 'en');
    if (report_type && report_type !== 'auto') result.report_type = report_type;
    return res.status(200).json(result);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
