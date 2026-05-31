import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Education = {
  id: string;
  school: string;
  degree: string;
  field: string;
  start: string;
  end: string;
  details: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  details: string;
};

export type Project = {
  id: string;
  name: string;
  link: string;
  description: string;
  tech: string;
};

export type Personal = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
};

export type TemplateId = "professional" | "modern" | "minimal";

export type ResumeData = {
  personal: Personal;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string[];
  photo?: string; // base64 data URL
  template: TemplateId;
};

export type Resume = ResumeData & {
  id: string;
  label: string;
};

type State = ResumeData & {
  resumes: Resume[];
  activeId: string;
  // mutators (operate on active resume)
  setPersonal: (p: Partial<Personal>) => void;
  setPhoto: (dataUrl: string | undefined) => void;
  setTemplate: (t: TemplateId) => void;
  addEducation: () => void;
  updateEducation: (id: string, p: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addExperience: () => void;
  updateExperience: (id: string, p: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  addProject: () => void;
  updateProject: (id: string, p: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setSkills: (s: string[]) => void;
  reset: () => void;
  // resume management
  createResume: (label?: string) => void;
  switchResume: (id: string) => void;
  renameResume: (id: string, label: string) => void;
  removeResume: (id: string) => void;
  duplicateResume: (id: string) => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const sampleData = (): ResumeData => ({
  template: "professional",
  personal: {
    name: "Alex Morgan",
    title: "Senior Product Designer",
    email: "alex@morgan.design",
    phone: "+1 (415) 555-0142",
    location: "San Francisco, CA",
    website: "morgan.design",
    summary:
      "Product designer with 8+ years shipping consumer and B2B software. I lead design from research through engineering hand-off, with a focus on systems thinking and craft.",
  },
  education: [
    {
      id: uid(),
      school: "Rhode Island School of Design",
      degree: "BFA",
      field: "Graphic Design",
      start: "2013",
      end: "2017",
      details: "Honors. Thesis on editorial typography systems.",
    },
  ],
  experience: [
    {
      id: uid(),
      company: "Linear",
      role: "Senior Product Designer",
      location: "Remote",
      start: "2022",
      end: "Present",
      details:
        "Led redesign of the issue triage flow, lifting weekly active triagers by 38%. Owned the design system migration to tokens.",
    },
    {
      id: uid(),
      company: "Stripe",
      role: "Product Designer",
      location: "San Francisco",
      start: "2018",
      end: "2022",
      details:
        "Shipped Stripe Tax onboarding and Dashboard navigation refresh used by 500k+ businesses.",
    },
  ],
  projects: [
    {
      id: uid(),
      name: "Field Notes CMS",
      link: "github.com/alex/field-notes",
      description: "Open-source markdown CMS for design teams. 2.1k stars.",
      tech: "TypeScript, Next.js, Postgres",
    },
  ],
  skills: [
    "Product Design",
    "Design Systems",
    "Figma",
    "User Research",
    "Prototyping",
    "HTML/CSS",
    "TypeScript",
  ],
});

const blankData = (): ResumeData => ({
  template: "professional",
  personal: { name: "", title: "", email: "", phone: "", location: "", website: "", summary: "" },
  education: [],
  experience: [],
  projects: [],
  skills: [],
});

const firstResume: Resume = { id: uid(), label: "My Resume", ...sampleData() };
const initialState: ResumeData & { resumes: Resume[]; activeId: string } = {
  ...sampleData(),
  resumes: [firstResume],
  activeId: firstResume.id,
};
// keep top-level in sync with first resume
Object.assign(initialState, { ...firstResume });

function pickData(s: ResumeData): ResumeData {
  return {
    template: s.template,
    photo: s.photo,
    personal: s.personal,
    education: s.education,
    experience: s.experience,
    projects: s.projects,
    skills: s.skills,
  };
}

export const useResume = create<State>()(
  persist(
    (set, get) => {
      // helper: apply a patch to the top-level data AND sync into the resumes array
      const syncSet = (patch: Partial<ResumeData>) =>
        set((s) => {
          const next = { ...s, ...patch };
          return {
            ...next,
            resumes: s.resumes.map((r) =>
              r.id === s.activeId ? { ...r, ...pickData(next) } : r,
            ),
          };
        });

      return {
        ...initialState,
        setPersonal: (p) => syncSet({ personal: { ...get().personal, ...p } }),
        setPhoto: (dataUrl) => syncSet({ photo: dataUrl }),
        setTemplate: (t) => syncSet({ template: t }),
        addEducation: () =>
          syncSet({
            education: [
              ...get().education,
              { id: uid(), school: "", degree: "", field: "", start: "", end: "", details: "" },
            ],
          }),
        updateEducation: (id, p) =>
          syncSet({ education: get().education.map((e) => (e.id === id ? { ...e, ...p } : e)) }),
        removeEducation: (id) => syncSet({ education: get().education.filter((e) => e.id !== id) }),
        addExperience: () =>
          syncSet({
            experience: [
              ...get().experience,
              { id: uid(), company: "", role: "", location: "", start: "", end: "", details: "" },
            ],
          }),
        updateExperience: (id, p) =>
          syncSet({ experience: get().experience.map((e) => (e.id === id ? { ...e, ...p } : e)) }),
        removeExperience: (id) =>
          syncSet({ experience: get().experience.filter((e) => e.id !== id) }),
        addProject: () =>
          syncSet({
            projects: [
              ...get().projects,
              { id: uid(), name: "", link: "", description: "", tech: "" },
            ],
          }),
        updateProject: (id, p) =>
          syncSet({ projects: get().projects.map((e) => (e.id === id ? { ...e, ...p } : e)) }),
        removeProject: (id) => syncSet({ projects: get().projects.filter((e) => e.id !== id) }),
        setSkills: (skills) => syncSet({ skills }),
        reset: () => {
          const fresh: Resume = { id: uid(), label: "My Resume", ...sampleData() };
          set({ ...sampleData(), resumes: [fresh], activeId: fresh.id, ...fresh });
        },

        createResume: (label) => {
          const r: Resume = { id: uid(), label: label || "Untitled Resume", ...blankData() };
          set((s) => ({ ...s, resumes: [...s.resumes, r], activeId: r.id, ...r }));
        },
        switchResume: (id) => {
          const r = get().resumes.find((x) => x.id === id);
          if (!r) return;
          set((s) => ({ ...s, activeId: id, ...pickData(r) }));
        },
        renameResume: (id, label) =>
          set((s) => ({ resumes: s.resumes.map((r) => (r.id === id ? { ...r, label } : r)) })),
        removeResume: (id) =>
          set((s) => {
            if (s.resumes.length <= 1) return s;
            const remaining = s.resumes.filter((r) => r.id !== id);
            const nextActive = s.activeId === id ? remaining[0] : s.resumes.find((r) => r.id === s.activeId)!;
            return { ...s, resumes: remaining, activeId: nextActive.id, ...pickData(nextActive) };
          }),
        duplicateResume: (id) =>
          set((s) => {
            const src = s.resumes.find((r) => r.id === id);
            if (!src) return s;
            const copy: Resume = { ...src, id: uid(), label: src.label + " (copy)" };
            return { ...s, resumes: [...s.resumes, copy], activeId: copy.id, ...copy };
          }),
      };
    },
    { name: "resume-studio-v2" },
  ),
);
