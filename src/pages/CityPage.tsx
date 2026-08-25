// src/pages/CityPage.tsx
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, X, Clock, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';
import { PLACES, type PlaceId } from '@/components/city/places';

const CityCanvas = lazy(() => import('@/components/city/CityCanvas'));

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Relógio local do visitante — só existe na cidade. Atualiza por minuto. */
const CityClock = ({ locale }: { locale: string }) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm font-semibold text-primary tabular-nums">
      <Clock className="w-4 h-4" />
      {now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
};

interface CardContent {
  title: string;
  subtitle?: string;
  body: string;
  tags: string[];
  live?: string;
  comingSoon?: boolean;
}

const CityPage = () => {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  const tc = t.city;
  const locale = language === 'pt' ? 'pt-BR' : 'en-US';

  const [webgl] = useState(supportsWebGL);
  const [activePlace, setActivePlace] = useState<PlaceId | null>(null);
  const [hovered, setHovered] = useState<PlaceId | null>(null);
  const [interacted, setInteracted] = useState(false);
  const [reducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [isMobile] = useState(() =>
    window.matchMedia('(max-width: 767px), (pointer: coarse)').matches);

  useEffect(() => {
    const prev = document.title;
    document.title = tc.seo;
    return () => { document.title = prev; };
  }, [tc.seo]);

  // Conteúdo do card por lugar, reusando traduções existentes.
  const card: CardContent | null = useMemo(() => {
    if (!activePlace) return null;
    const place = PLACES.find((p) => p.id === activePlace);
    if (!place) return null;
    const names = tc.placeNames as Record<string, string>;
    switch (place.kind) {
      case 'project': {
        const item = t.projects.items[activePlace as keyof typeof t.projects.items];
        return { title: item.title, body: item.description, tags: [],
          live: place.live, comingSoon: place.comingSoon };
      }
      case 'experience': {
        const idx = activePlace === 'exp-twiniti' ? 0 : 1;
        const e = t.experience.list[idx];
        return { title: e.company, subtitle: `${e.title} · ${e.period}`,
          body: e.description, tags: [] };
      }
      case 'education': {
        if (activePlace === 'edu-unip') {
          const d = t.education.degree;
          return { title: d.institution, subtitle: `${d.title} · ${d.period}`,
            body: d.description, tags: [] };
        }
        return { title: 'Rocketseat', subtitle: t.education.coursesTitle,
          body: t.education.courses.map((c) => c.name).join(' · '), tags: [] };
      }
      case 'skills': {
        const key = activePlace.replace('skills-', '') as 'frontend' | 'backend' | 'tools' | 'ai';
        const stacks: Record<typeof key, string[]> = {
          frontend: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Vite'],
          backend: ['Java', 'Spring Boot', 'Quarkus', 'C#', 'Node.js', 'SQL'],
          tools: ['Git', 'Docker', 'Supabase', 'GitHub Actions', 'Figma'],
          ai: ['Claude Code', 'Lovable', 'Antigravity', 'Gemini Code'],
        };
        return { title: names[activePlace], subtitle: t.techStack.title,
          body: '', tags: stacks[key] };
      }
      case 'contact':
        return { title: t.contact.title, body: t.contact.subtitle, tags: [],
          live: 'https://wa.me/5512987083178' };
    }
  }, [activePlace, t, tc]);

  const labels: Record<string, string> = useMemo(() => ({
    ...Object.fromEntries(
      Object.entries(t.projects.items).map(([k, v]) => [k, v.title.toUpperCase()])),
    ...Object.fromEntries(
      Object.entries(tc.placeNames).map(([k, v]) => [k, (v as string).toUpperCase()])),
    'prontiva-soon': tc.comingSoon.toUpperCase(),
  }), [t, tc]);

  const hoveredName = hovered
    ? (t.projects.items as Record<string, { title: string }>)[hovered]?.title
      ?? (tc.placeNames as Record<string, string>)[hovered]
    : null;

  if (!webgl) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="text-muted-foreground">{tc.noWebgl}</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> {tc.backToSite}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-background">
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }>
        <CityCanvas
          activePlace={activePlace}
          onSelect={(id) => { setActivePlace(id); setInteracted(true); }}
          onHover={setHovered}
          hoveredId={hovered}
          labels={labels}
          reducedMotion={reducedMotion}
          isMobile={isMobile}
        />
      </Suspense>

      {/* HUD topo: voltar | relógio + idioma */}
      <header className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 py-4 pointer-events-none">
        <Link to="/" className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
          <ArrowLeft className="w-4 h-4" /> {tc.backToSite}
        </Link>
        <div className="pointer-events-auto flex items-center gap-2">
          <CityClock locale={locale} />
          <button onClick={toggleLanguage}
            className="px-3.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-full glass border border-white/10 uppercase tracking-widest transition-colors duration-200">
            {language === 'pt' ? 'BR' : 'EN'}
          </button>
        </div>
      </header>

      {/* Tooltip de hover (desktop) */}
      {hoveredName && !activePlace && (
        <div className="absolute top-20 inset-x-0 z-10 flex justify-center pointer-events-none">
          <span className="px-4 py-1.5 rounded-full glass border border-primary/30 text-sm text-primary font-medium">
            {hoveredName}
          </span>
        </div>
      )}

      {/* Dica inicial */}
      {!interacted && !activePlace && (
        <div className="absolute bottom-8 inset-x-0 z-10 flex justify-center pointer-events-none">
          <span className="px-5 py-2.5 rounded-full glass border border-white/10 text-sm text-muted-foreground animate-pulse-soft">
            {tc.hint}
          </span>
        </div>
      )}

      {/* Card de conteúdo */}
      {card && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center p-4 md:p-8 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md card-outer glow-primary">
            <div className="card-inner relative">
              <button onClick={() => setActivePlace(null)} aria-label={tc.close}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors duration-200">
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-bold text-foreground pr-10">{card.title}</h2>
              {card.subtitle && <p className="text-sm text-primary mt-1">{card.subtitle}</p>}
              {card.body && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{card.body}</p>}
              {card.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {card.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full glass text-xs text-muted-foreground border border-primary/10">{tag}</span>
                  ))}
                </div>
              )}
              {card.comingSoon && (
                <span className="inline-block mt-4 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">{tc.comingSoon}</span>
              )}
              {card.live && (
                <a href={card.live} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors duration-200">
                  <ExternalLink className="w-4 h-4" /> {tc.viewLive}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityPage;
