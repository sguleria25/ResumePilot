import { useResume } from "@/lib/resume-store";
import type { ResumeData } from "@/lib/resume-store";

export function ResumePreview() {
  const data = useResume();
  const t = data.template;
  return (
    <div className="mx-auto w-full max-w-[760px]">
      {t === "professional" && <Professional data={data} />}
      {t === "modern" && <Modern data={data} />}
      {t === "minimal" && <Minimal data={data} />}
    </div>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <article
      className="rounded-md bg-card p-12 text-card-foreground shadow-[var(--shadow-elegant)] ring-1 ring-border"
      style={{ aspectRatio: "8.5 / 11", minHeight: 900 }}
    >
      {children}
    </article>
  );
}

function Photo({ src, size = 84, ring = "ring-primary/20" }: { src?: string; size?: number; ring?: string }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt="Profile"
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full object-cover ring-2 ${ring}`}
    />
  );
}

/* ---------- Professional (current Navy) ---------- */
function Professional({ data }: { data: ResumeData }) {
  const { personal, education, experience, projects, skills, photo } = data;
  return (
    <Page>
      <header className="flex items-center gap-5 border-b-2 border-primary pb-5">
        <Photo src={photo} />
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold text-primary">{personal.name || "Your Name"}</h1>
          {personal.title && <p className="mt-1 text-base text-accent">{personal.title}</p>}
          <p className="mt-3 text-[11px] text-muted-foreground">
            {[personal.email, personal.phone, personal.location, personal.website].filter(Boolean).join("  •  ")}
          </p>
        </div>
      </header>
      {personal.summary && <p className="mt-5 text-[12.5px] leading-relaxed">{personal.summary}</p>}
      <Section title="Experience">
        {experience.map((e) => (
          <Block key={e.id} title={`${e.role}${e.company ? " · " + e.company : ""}`} meta={`${e.start}${e.end ? " – " + e.end : ""}`} sub={e.location} body={e.details} />
        ))}
      </Section>
      <Section title="Projects">
        {projects.map((p) => (
          <Block key={p.id} title={p.name || "Untitled"} meta={p.tech} sub={p.link} body={p.description} />
        ))}
      </Section>
      <Section title="Education">
        {education.map((e) => (
          <Block key={e.id} title={`${e.degree}${e.field ? ", " + e.field : ""}${e.school ? " · " + e.school : ""}`} meta={`${e.start}${e.end ? " – " + e.end : ""}`} body={e.details} />
        ))}
      </Section>
      {skills.length > 0 && (
        <Section title="Skills">
          <p className="text-[12px] leading-relaxed">{skills.join(" · ")}</p>
        </Section>
      )}
    </Page>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const arr = Array.isArray(children) ? children : [children];
  if (arr.filter(Boolean).length === 0) return null;
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center gap-3">
        <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-accent">{title}</h2>
        <span className="h-px flex-1 bg-accent/40" />
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
function Block({ title, meta, sub, body }: { title: string; meta?: string; sub?: string; body?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[12.5px] font-semibold text-foreground">{title}</h3>
        {meta && <span className="text-[11px] text-muted-foreground">{meta}</span>}
      </div>
      {sub && <p className="text-[11px] italic text-muted-foreground">{sub}</p>}
      {body && <p className="mt-1 text-[12px] leading-relaxed">{body}</p>}
    </div>
  );
}

/* ---------- Modern (two-column with sidebar) ---------- */
function Modern({ data }: { data: ResumeData }) {
  const { personal, education, experience, projects, skills, photo } = data;
  return (
    <Page>
      <div className="grid h-full grid-cols-[1fr_2fr] gap-6">
        <aside className="-m-12 mr-0 rounded-l-md bg-primary p-8 text-primary-foreground">
          {photo && <Photo src={photo} size={96} ring="ring-primary-foreground/40" />}
          <h1 className="mt-4 font-display text-2xl font-bold leading-tight">{personal.name || "Your Name"}</h1>
          {personal.title && <p className="mt-1 text-sm opacity-90">{personal.title}</p>}
          <div className="mt-6 space-y-1.5 text-[11px] opacity-90">
            {personal.email && <p>{personal.email}</p>}
            {personal.phone && <p>{personal.phone}</p>}
            {personal.location && <p>{personal.location}</p>}
            {personal.website && <p>{personal.website}</p>}
          </div>
          {skills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-80">Skills</h3>
              <ul className="mt-2 space-y-1 text-[11.5px]">
                {skills.map((s) => <li key={s}>• {s}</li>)}
              </ul>
            </div>
          )}
          {education.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-80">Education</h3>
              <div className="mt-2 space-y-2 text-[11px]">
                {education.map((e) => (
                  <div key={e.id}>
                    <p className="font-semibold">{e.degree}{e.field ? `, ${e.field}` : ""}</p>
                    <p className="opacity-90">{e.school}</p>
                    <p className="opacity-70">{e.start}{e.end ? ` – ${e.end}` : ""}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
        <main className="py-2">
          {personal.summary && (
            <>
              <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.15em] text-primary">Profile</h2>
              <p className="mt-2 text-[12.5px] leading-relaxed">{personal.summary}</p>
            </>
          )}
          {experience.length > 0 && (
            <div className="mt-5">
              <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.15em] text-primary">Experience</h2>
              <div className="mt-2 space-y-3">
                {experience.map((e) => (
                  <div key={e.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[12.5px] font-semibold">{e.role}</h3>
                      <span className="text-[11px] text-muted-foreground">{e.start}{e.end ? ` – ${e.end}` : ""}</span>
                    </div>
                    <p className="text-[11.5px] text-accent">{e.company}{e.location ? ` · ${e.location}` : ""}</p>
                    {e.details && <p className="mt-1 text-[12px] leading-relaxed">{e.details}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {projects.length > 0 && (
            <div className="mt-5">
              <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.15em] text-primary">Projects</h2>
              <div className="mt-2 space-y-3">
                {projects.map((p) => (
                  <div key={p.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[12.5px] font-semibold">{p.name}</h3>
                      <span className="text-[11px] text-muted-foreground">{p.tech}</span>
                    </div>
                    {p.link && <p className="text-[11px] italic text-muted-foreground">{p.link}</p>}
                    {p.description && <p className="mt-1 text-[12px] leading-relaxed">{p.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </Page>
  );
}

/* ---------- Minimal (centered, serif-free, lots of whitespace) ---------- */
function Minimal({ data }: { data: ResumeData }) {
  const { personal, education, experience, projects, skills, photo } = data;
  return (
    <Page>
      <header className="flex flex-col items-center text-center">
        <Photo src={photo} size={72} ring="ring-border" />
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">{personal.name || "Your Name"}</h1>
        {personal.title && <p className="text-sm text-muted-foreground">{personal.title}</p>}
        <p className="mt-2 text-[11px] text-muted-foreground">
          {[personal.email, personal.phone, personal.location, personal.website].filter(Boolean).join(" · ")}
        </p>
      </header>
      {personal.summary && <p className="mx-auto mt-6 max-w-prose text-center text-[12.5px] leading-relaxed">{personal.summary}</p>}
      <MinSection title="Experience">
        {experience.map((e) => (
          <div key={e.id} className="grid grid-cols-[110px_1fr] gap-4">
            <span className="text-[11px] text-muted-foreground">{e.start}{e.end ? ` – ${e.end}` : ""}</span>
            <div>
              <p className="text-[12.5px] font-semibold">{e.role}{e.company ? ` · ${e.company}` : ""}</p>
              {e.details && <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{e.details}</p>}
            </div>
          </div>
        ))}
      </MinSection>
      <MinSection title="Projects">
        {projects.map((p) => (
          <div key={p.id} className="grid grid-cols-[110px_1fr] gap-4">
            <span className="text-[11px] text-muted-foreground">{p.tech}</span>
            <div>
              <p className="text-[12.5px] font-semibold">{p.name}</p>
              {p.description && <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{p.description}</p>}
            </div>
          </div>
        ))}
      </MinSection>
      <MinSection title="Education">
        {education.map((e) => (
          <div key={e.id} className="grid grid-cols-[110px_1fr] gap-4">
            <span className="text-[11px] text-muted-foreground">{e.start}{e.end ? ` – ${e.end}` : ""}</span>
            <p className="text-[12.5px]"><span className="font-semibold">{e.degree}{e.field ? `, ${e.field}` : ""}</span> — {e.school}</p>
          </div>
        ))}
      </MinSection>
      {skills.length > 0 && (
        <MinSection title="Skills">
          <p className="text-center text-[12px] text-muted-foreground">{skills.join("   ·   ")}</p>
        </MinSection>
      )}
    </Page>
  );
}
function MinSection({ title, children }: { title: string; children: React.ReactNode }) {
  const arr = Array.isArray(children) ? children : [children];
  if (arr.filter(Boolean).length === 0) return null;
  return (
    <section className="mt-7">
      <h2 className="mb-3 text-center font-display text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
