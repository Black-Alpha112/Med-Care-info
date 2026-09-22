import { useLanguage } from '../contexts/LanguageContext';

const pages = {
  privacy: {
    en: {
      title: 'Privacy Policy',
      body: [
        'ClearMed AI is built privacy-first. Text you paste is sent to our simplify API to produce a plain-language reading. We do not sell personal data.',
        'Unsaved reports stay in your browser session. Saved reports are stored only when you are signed in, and only for your account.',
        'We do not need your name, date of birth, or medical record number. Please avoid pasting identifiers when you can.',
        'Authentication is handled by Supabase. Google sign-in uses a standard OAuth flow.',
      ],
    },
    es: {
      title: 'Política de privacidad',
      body: [
        'ClearMed AI se construye con la privacidad primero. El texto que pegas se envía a nuestra API de simplificación. No vendemos datos personales.',
        'Los informes no guardados permanecen en tu sesión. Los informes guardados solo se almacenan si inicias sesión y solo para tu cuenta.',
        'No necesitamos tu nombre, fecha de nacimiento ni número de historia. Evita pegar identificadores cuando puedas.',
        'La autenticación la gestiona Supabase. El acceso con Google usa OAuth estándar.',
      ],
    },
  },
  terms: {
    en: {
      title: 'Terms of Service',
      body: [
        'ClearMed AI is an educational product that rewrites medical language into everyday words. It is provided as-is, without warranties of completeness or clinical accuracy.',
        'You agree not to rely on ClearMed AI as medical advice, diagnosis, or treatment. Always confirm with a licensed clinician.',
        'You are responsible for the text you submit. Do not upload content you are not allowed to share.',
        'We may update these terms as the product evolves. Continued use means you accept the current version.',
      ],
    },
    es: {
      title: 'Términos de servicio',
      body: [
        'ClearMed AI es un producto educativo que reescribe el lenguaje médico. Se ofrece tal cual, sin garantías de exhaustividad ni exactitud clínica.',
        'Aceptas no usar ClearMed AI como consejo médico, diagnóstico o tratamiento. Confirma siempre con un clínico colegiado.',
        'Eres responsable del texto que envías. No subas contenido que no puedas compartir.',
        'Podemos actualizar estos términos. Seguir usando el producto implica aceptar la versión vigente.',
      ],
    },
  },
  disclaimer: {
    en: {
      title: 'Medical Accuracy Disclaimer',
      body: [
        'ClearMed AI is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease.',
        'Lab reference ranges shown are general adult approximations. Your clinician may use different ranges based on age, sex, pregnancy, labs, and history.',
        'Medication explanations are educational summaries, not dosing instructions. Never start, stop, or change a medicine based on this tool.',
        'If you have chest pain, trouble breathing, severe bleeding, confusion, or any emergency symptom, call local emergency services immediately.',
        'AI systems can misread unusual formatting, rare conditions, or incomplete documents. When in doubt, ask your care team.',
      ],
    },
    es: {
      title: 'Aviso de exactitud médica',
      body: [
        'ClearMed AI no es un dispositivo médico y no está destinado a diagnosticar, tratar, curar ni prevenir enfermedades.',
        'Los rangos de laboratorio son aproximaciones generales de adultos. Tu clínico puede usar rangos distintos.',
        'Las explicaciones de medicamentos son resúmenes educativos, no instrucciones de dosis. Nunca inicies, detengas o cambies un fármaco por esta herramienta.',
        'Si tienes dolor de pecho, dificultad para respirar, sangrado grave, confusión o cualquier síntoma de emergencia, llama a servicios de urgencias.',
        'Los sistemas de IA pueden malinterpretar formatos inusuales, condiciones raras o documentos incompletos. En caso de duda, consulta a tu equipo de salud.',
      ],
    },
  },
};

export default function Legal({ kind }) {
  const { lang } = useLanguage();
  const page = pages[kind][lang] || pages[kind].en;

  return (
    <article className="py-14">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{page.title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {page.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </article>
  );
}
