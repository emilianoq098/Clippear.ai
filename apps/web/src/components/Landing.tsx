import type { ReactNode } from 'react';
import BeforeAfter from './BeforeAfter';
import FileDropzone from './FileDropzone';
import HighlightDemo from './HighlightDemo';
import MagneticLink from './MagneticLink';
import Reveal from './Reveal';
import YoutubeUrlInput from './YoutubeUrlInput';

type Locale = 'es' | 'en';
type LandingCopy = {
  nav: string[]; heroTitle: ReactNode; heroBody: string; cta: string; watch: string; noCard: string;
  drop: string; browse: string; highlight: string; score: string; formats: string; howTitle: string;
  howLead: string; steps: [string, string][]; toolsTitle: string; toolsLead: string;
  features: [string, string, string][]; beforeTitle: ReactNode; beforeLead: string;
  templatesTitle: string; templatesLead: string; templates: [string, string][];
  pricingTitle: string; pricingLead: string; plans: [string, string][];
  faqTitle: string; faqs: [string, string][]; finalTitle: ReactNode; finalCta: string;
  footer: string; privacy: string; terms: string;
};

const messages: Record<Locale, LandingCopy> = {
  es: {
    nav: ['Highlights', 'Audio Hub', 'Editor', 'Precios'],
    heroTitle: <>Encontrá lo <em>mejor</em><br />de cualquier video.</>,
    heroBody: 'Si subís un video, la IA encuentra los mejores momentos y los separa en clips. Si subís fotos, las ordena y arma un video coherente. Después podés agregar una pista de audio.',
    cta: 'Probar gratis', watch: 'Ver cómo funciona', noCard: 'Sin tarjeta de crédito',
    drop: 'Soltá un video, un audio o tus fotos', browse: 'o elegilos desde tu equipo',
    highlight: 'MOMENTOS QUE MERECEN VOLVER A VERSE', score: 'PUNTAJE EXPLICADO',
    formats: 'Un video. Listo para donde estés.',
    howTitle: 'De largo a inolvidable.', howLead: 'Tu material entra. Los momentos que importan salen.',
    steps: [
      ['Subí', 'Un video largo, un audio o una carpeta de fotos. Tus originales siempre quedan intactos.'],
      ['La IA elige', 'Encontramos ganchos, ideas y emociones. Cada clip viene con su puntaje y el porqué.'],
      ['Editá y publicá', 'Ajustá el corte, los subtítulos y el formato. Exportá o prepará tu próxima publicación.'],
    ],
    toolsTitle: 'Todo lo que pasa después de grabar.', toolsLead: 'Un lugar para encontrar, pulir y compartir lo que ya tenés.',
    features: [
      ['HIGHLIGHTS', 'Los mejores momentos, sin volver a mirar una hora entera.', 'violet'],
      ['AUDIO HUB', 'Transcribí, limpiá y dale voz a tus ideas.', 'pink'],
      ['EDITOR POR TEXTO', 'Borrá una frase. El corte acompaña.', 'warm'],
      ['FOTO → VIDEO', 'Ordená recuerdos. Sumales ritmo, voz y movimiento.', 'mint'],
      ['COVER STUDIO', 'Una portada que invita a quedarse.', 'blue'],
      ['SUBTÍTULOS', 'Palabra a palabra, con tu estilo.', 'gold'],
    ],
    beforeTitle: <>Una hora de charla.<br />Ocho momentos que <em>quedan.</em></>,
    beforeLead: 'Encontrá lo que hace reír, lo que enseña y lo que vale la pena contar.',
    templatesTitle: 'Cada historia tiene su ritmo.', templatesLead: 'Empezá con una idea cercana y llevála a tu manera.',
    templates: [['Podcast', 'Conversaciones que merecen salir del episodio.'], ['Gaming', 'Reacciones, jugadas y momentos inesperados.'], ['Clases', 'Ideas claras, listas para volver a aprender.'], ['Eventos', 'La energía de un día entero en pocos minutos.'], ['Recuerdos', 'Fotos y escenas unidas con música y voz.'], ['Marcas', 'Una historia de producto, fácil de compartir.']],
    pricingTitle: 'Pagá por lo que procesás.', pricingLead: 'Créditos claros por minuto de video. Voz, doblaje y renders largos se detallan antes de empezar.',
    plans: [['Para probar', 'Encontrá tus primeros momentos.'], ['Para crear', 'Más minutos para publicar cada semana.'], ['Para equipos', 'Proyectos compartidos y flujo de aprobación.']],
    faqTitle: 'Preguntas que suelen aparecer.', faqs: [['¿Tengo que subir el video a una red social?', 'No. Procesamos los archivos que subís o conectás desde tus propias cuentas. No descargamos videos de redes sociales.'], ['¿Clipper cambia mi archivo original?', 'No. El original se conserva. Tus cortes y ajustes quedan como decisiones de edición que podés cambiar.'], ['¿El puntaje garantiza que un clip se vuelva viral?', 'No. Resume señales de gancho, claridad y ritmo para ayudarte a elegir. No predice ni promete viralidad.'], ['¿Puedo usar mis audios de ElevenLabs?', 'Sí. Podés importar tus archivos de audio y conectar tu propia cuenta cuando esté disponible en Audio Hub.']],
    finalTitle: <>Lo bueno ya está ahí.<br /><em>Encontrémoslo.</em></>, finalCta: 'Empezar gratis',
    footer: 'Tus historias, en buenas manos.', privacy: 'Privacidad', terms: 'Términos',
  },
  en: {
    nav: ['Highlights', 'Audio Hub', 'Editor', 'Pricing'],
    heroTitle: <>Find the <em>best</em><br />in any video.</>,
    heroBody: 'For video, AI finds the best moments and separates them into clips. For photos, it arranges them into a coherent video. Then you can add an audio track.',
    cta: 'Try it free', watch: 'See how it works', noCard: 'No credit card needed',
    drop: 'Drop a video, audio, or your photos', browse: 'or choose them from your device',
    highlight: 'MOMENTS WORTH WATCHING AGAIN', score: 'EXPLAINED SCORE',
    formats: 'One video. Ready for wherever you are.',
    howTitle: 'From long to unforgettable.', howLead: 'Your footage goes in. The moments that matter come out.',
    steps: [
      ['Upload', 'A long video, an audio file, or a folder of photos. Your originals always stay untouched.'],
      ['AI finds the moments', 'We find hooks, ideas, and emotion. Every clip comes with a score and the reason behind it.'],
      ['Edit and publish', 'Fine-tune the cut, captions, and format. Export or prep your next post.'],
    ],
    toolsTitle: 'Everything that happens after you record.', toolsLead: 'One place to find, polish, and share what you already have.',
    features: [
      ['HIGHLIGHTS', 'The best moments, without rewatching the whole hour.', 'violet'],
      ['AUDIO HUB', 'Transcribe, clean up, and give your ideas a voice.', 'pink'],
      ['TEXT-BASED EDITOR', 'Delete a sentence. The cut follows.', 'warm'],
      ['PHOTO → VIDEO', 'Put memories in order. Add rhythm, voice, and motion.', 'mint'],
      ['COVER STUDIO', 'A cover that makes people want to stay.', 'blue'],
      ['CAPTIONS', 'Word by word, in your style.', 'gold'],
    ],
    beforeTitle: <>One hour of conversation.<br />Eight moments that <em>stick.</em></>,
    beforeLead: 'Find the parts that make people laugh, teach something, and deserve to be shared.',
    templatesTitle: 'Every story has its own rhythm.', templatesLead: 'Start with a familiar idea and make it yours.',
    templates: [['Podcast', 'Conversations ready to step beyond the episode.'], ['Gaming', 'Reactions, big plays, and unexpected moments.'], ['Classes', 'Clear ideas, ready to learn from again.'], ['Events', 'The energy of a full day in a few minutes.'], ['Memories', 'Photos and scenes woven with music and voice.'], ['Brands', 'A product story that is easy to share.']],
    pricingTitle: 'Pay for what you process.', pricingLead: 'Clear credits per video minute. Voice, dubbing, and long renders are priced before you start.',
    plans: [['Just exploring', 'Find your first standout moments.'], ['For creators', 'More minutes to post every week.'], ['For teams', 'Shared projects and an approval flow.']],
    faqTitle: 'A few things people ask.', faqs: [['Do I need to upload my video to social media?', 'No. We process files you upload or connect from your own accounts. We do not download videos from social platforms.'], ['Does Clipper change my original file?', 'No. Your original stays untouched. Cuts and edits are saved as decisions you can change.'], ['Does the score guarantee a viral clip?', 'No. It summarizes signals like hook, clarity, and pacing to help you choose. It does not predict or promise virality.'], ['Can I use my ElevenLabs audio?', 'Yes. You can import your audio files and connect your own account when it becomes available in Audio Hub.']],
    finalTitle: <>The good part is already there.<br /><em>Let’s find it.</em></>, finalCta: 'Get started free',
    footer: 'Your stories, in good hands.', privacy: 'Privacy', terms: 'Terms',
  },
};

const formatNames = ['TikTok', 'Reels', 'Shorts', 'YouTube', 'LinkedIn'];
const formatMarks = ['♪', '◎', '▶', '▶', 'in'];
const featureSymbols = ['✳', '◖', '⌁', '▱', '▣', 'Aa'];
const templateSymbols = ['◉', '⌘', '▤', '✳', '◌', '◇'];

export default function Landing({ lang }: { lang: Locale }) {
  const copy = messages[lang];
  const label = (es: string, en: string) => lang === 'es' ? es : en;
  return (
    <main className="landing" lang={lang}>
      <header className="site-nav">
        <a className="brand" href="#top" aria-label="Clipper home"><span>cl</span><span className="brand-cut"><i />i</span><span>pper</span><b>.ai</b></a>
        <nav className="nav-links" aria-label={label('Navegación principal', 'Main navigation')}><a href="#highlights">{copy.nav[0]}</a><a href="#audio">{copy.nav[1]}</a><a href="#editor">{copy.nav[2]}</a><a href="#precios">{copy.nav[3]}</a></nav>
        <div className="nav-actions"><a className="language-switch" href={lang === 'es' ? '/en' : '/'} aria-label={label('Switch to English', 'Cambiar a español')}>{lang === 'es' ? 'EN' : 'ES'}</a><MagneticLink href="#upload" className="nav-cta">{copy.cta}</MagneticLink></div>
      </header>

      <section className="hero-section" id="top">
        <div className="hero-heading">
          <p className="hero-kicker"><span className="kicker-spark">✳</span>{label('EDICIÓN CON BUEN OJO', 'A BETTER WAY TO EDIT')}</p>
          <h1>{copy.heroTitle}</h1>
        </div>
        <div className="hero-upload"><FileDropzone lang={lang} kind="media" className="drop-zone--wide" /></div>
        <div className="hero-upload hero-upload--youtube"><YoutubeUrlInput lang={lang} /></div>
        <div className="hero-upload hero-upload--audio"><FileDropzone lang={lang} kind="audio" className="drop-zone--wide drop-zone--audio" id="audio-track" /></div>
        <p className="hero-description hero-explainer">{copy.heroBody}</p>
        <div className="hero-copy">
          <div className="hero-actions"><MagneticLink href="#upload">{copy.cta}<span aria-hidden="true">↗</span></MagneticLink><a className="text-action" href="#como-funciona"><span className="play-small">▶</span>{copy.watch}</a></div>
          <p className="no-card"><span>✓</span>{copy.noCard}</p>
        </div>
        <div className="hero-demo-wrap"><div className="demo-orbit demo-orbit--one" /><div className="demo-orbit demo-orbit--two" /><HighlightDemo lang={lang} /><div className="demo-score-callout"><span className="score-star">✳</span><span><b>{copy.highlight}</b><small>{copy.score}</small></span><strong>94</strong></div></div>
      </section>

      <section className="format-rail" aria-label={label('Formatos compatibles', 'Supported platforms')}><span className="format-lead">{copy.formats}</span><div className="format-list">{formatNames.map((name, index) => <span className={`format-name format-name--${index}`} key={name}><b>{formatMarks[index]}</b>{name}</span>)}</div></section>

      <section className="steps-section content-section" id="como-funciona">
        <div className="section-intro"><p className="section-label">{label('ASÍ DE SIMPLE', 'THREE SIMPLE STEPS')}</p><h2>{copy.howTitle}</h2><p>{copy.howLead}</p></div>
        <div className="steps-row">{copy.steps.map(([title, detail], index) => <Reveal className="step-reveal" delay={index * 0.1} key={title}><article className="step"><span className="step-index">{String(index + 1).padStart(2, '0')}</span><div className={`step-art step-art--${index}`}><span>{['↥', '✳', '↗'][index]}</span><i /></div><h3>{title}</h3><p>{detail}</p></article></Reveal>)}</div>
      </section>

      <section className="features-section content-section" id="highlights">
        <div className="section-intro section-intro--wide"><p className="section-label">{label('TU ESTUDIO, DESPUÉS DE GRABAR', 'YOUR STUDIO, AFTER RECORDING')}</p><h2>{copy.toolsTitle}</h2><p>{copy.toolsLead}</p></div>
        <div className="feature-grid">{copy.features.map(([tag, title, tint], index) => <Reveal className="feature-reveal" delay={(index % 3) * 0.06} key={tag}><article className={`feature-card feature-card--${tint}`} id={index === 1 ? 'audio' : index === 2 ? 'editor' : undefined}><div className={`feature-art feature-art--${index}`}><span className="feature-symbol">{featureSymbols[index]}</span>{index === 0 && <div className="feature-score-pills"><b>94</b><b>91</b><b>88</b></div>}{index === 1 && <div className="audio-rings"><i /><i /><i /><i /></div>}{index === 2 && <div className="edit-lines"><i /><i /><i /><b /></div>}{index === 3 && <div className="photo-stack"><i /><i /><i /></div>}{index === 4 && <div className="cover-type">TU<br /><em>historia</em></div>}{index === 5 && <div className="caption-pills"><i>palabra</i><b>a</b><i>palabra</i></div>}</div><p className="feature-label">{tag}</p><h3>{title}</h3><span className="feature-link" aria-hidden="true">↗</span></article></Reveal>)}</div>
      </section>

      <section className="comparison-section content-section"><div className="comparison-intro"><p className="section-label">{label('EL CAMBIO SE NOTA', 'SEE THE DIFFERENCE')}</p><h2>{copy.beforeTitle}</h2><p>{copy.beforeLead}</p></div><BeforeAfter lang={lang} /></section>

      <section className="templates-section content-section"><div className="section-intro section-intro--wide"><p className="section-label">{label('TU HISTORIA, TU FORMATO', 'YOUR STORY, YOUR FORMAT')}</p><h2>{copy.templatesTitle}</h2><p>{copy.templatesLead}</p></div><div className="template-grid">{copy.templates.map(([title, detail], index) => <a href="#soltar" className={`template-item template-item--${index}`} key={title}><span className="template-glyph">{templateSymbols[index]}</span><span className="template-copy"><b>{title}</b><small>{detail}</small></span><span className="template-arrow">↗</span></a>)}</div></section>

      <section className="pricing-section content-section" id="precios"><div className="pricing-copy"><p className="section-label">{label('CLARO DESDE EL PRINCIPIO', 'CLEAR FROM THE START')}</p><h2>{copy.pricingTitle}</h2><p>{copy.pricingLead}</p><a className="pricing-detail" href="#preguntas">{label('Cómo funcionan los créditos', 'How credits work')} <span>↗</span></a></div><div className="plan-list">{copy.plans.map(([title, detail], index) => <article className={`plan-row ${index === 1 ? 'plan-row--featured' : ''}`} key={title}><span className="plan-number">0{index + 1}</span><div><h3>{title}</h3><p>{detail}</p></div><span className="plan-mark">{index === 1 ? '✳' : '↗'}</span></article>)}</div></section>

      <section className="faq-section content-section" id="preguntas"><div className="faq-title"><p className="section-label">FAQ</p><h2>{copy.faqTitle}</h2></div><div className="faq-list">{copy.faqs.map(([question, answer]) => <details className="faq-item" key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>

      <section className="closing-section" id="soltar"><div className="closing-glow" /><p className="section-label">{label('YA TENÉS TODO EL MATERIAL', 'YOU ALREADY HAVE THE FOOTAGE')}</p><h2>{copy.finalTitle}</h2><MagneticLink href="#top">{copy.finalCta}<span aria-hidden="true">↗</span></MagneticLink><small>{copy.noCard}</small></section>

      <footer className="site-footer"><a className="brand brand--footer" href="#top"><span>cl</span><span className="brand-cut"><i />i</span><span>pper</span><b>.ai</b></a><span className="footer-note">{copy.footer}</span><div><a href="#preguntas">{copy.privacy}</a><a href="#preguntas">{copy.terms}</a><a href={lang === 'es' ? '/en' : '/'}>{lang === 'es' ? 'English' : 'Español'}</a></div><span className="copyright">© 2026 Clipper</span></footer>
    </main>
  );
}
