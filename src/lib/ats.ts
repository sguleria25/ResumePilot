import type { ResumeData } from "./resume-store";

const SECTION_WEIGHT = {
  summary: 10,
  experience: 25,
  education: 15,
  skills: 15,
  projects: 10,
  contact: 10,
};

export type AtsResult = {
  score: number;
  breakdown: { label: string; score: number; max: number; hint?: string }[];
  matchedKeywords: string[];
  missingKeywords: string[];
  wordCount: number;
};

const allText = (data: ResumeData) =>
  [
    data.personal.name,
    data.personal.title,
    data.personal.summary,
    ...data.experience.flatMap((e) => [e.role, e.company, e.details]),
    ...data.education.flatMap((e) => [e.degree, e.field, e.school, e.details]),
    ...data.projects.flatMap((p) => [p.name, p.tech, p.description]),
    ...data.skills,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const tokenize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9+#./ -]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

export function analyzeResume(data: ResumeData, jobDescription = ""): AtsResult {
  const breakdown: AtsResult["breakdown"] = [];
  let score = 0;

  // Summary
  const sumOk = data.personal.summary.trim().length >= 60;
  const sumPts = sumOk ? SECTION_WEIGHT.summary : Math.round((data.personal.summary.length / 60) * SECTION_WEIGHT.summary);
  breakdown.push({
    label: "Professional summary",
    score: sumPts,
    max: SECTION_WEIGHT.summary,
    hint: sumOk ? undefined : "Add a 2–3 sentence summary (60+ chars).",
  });
  score += sumPts;

  // Experience
  const expCount = data.experience.length;
  const expDetail = data.experience.filter((e) => e.details.trim().length > 40).length;
  const expPts = Math.min(SECTION_WEIGHT.experience, expCount * 8 + expDetail * 4);
  breakdown.push({
    label: "Experience",
    score: expPts,
    max: SECTION_WEIGHT.experience,
    hint: expCount === 0 ? "Add at least one role." : expDetail < expCount ? "Expand bullet points with measurable impact." : undefined,
  });
  score += expPts;

  // Education
  const eduPts = data.education.length > 0 ? SECTION_WEIGHT.education : 0;
  breakdown.push({ label: "Education", score: eduPts, max: SECTION_WEIGHT.education, hint: eduPts === 0 ? "Add at least one education entry." : undefined });
  score += eduPts;

  // Skills
  const skillsPts = Math.min(SECTION_WEIGHT.skills, data.skills.length * 2);
  breakdown.push({
    label: "Skills",
    score: skillsPts,
    max: SECTION_WEIGHT.skills,
    hint: data.skills.length < 6 ? "Aim for 6–12 relevant skills." : undefined,
  });
  score += skillsPts;

  // Projects
  const projPts = Math.min(SECTION_WEIGHT.projects, data.projects.length * 5);
  breakdown.push({
    label: "Projects",
    score: projPts,
    max: SECTION_WEIGHT.projects,
    hint: data.projects.length === 0 ? "Add a project to stand out." : undefined,
  });
  score += projPts;

  // Contact
  const has = (s: string) => s.trim().length > 0;
  const contactCount = [has(data.personal.email), has(data.personal.phone), has(data.personal.location), has(data.personal.name)].filter(Boolean).length;
  const contactPts = Math.round((contactCount / 4) * SECTION_WEIGHT.contact);
  breakdown.push({
    label: "Contact info",
    score: contactPts,
    max: SECTION_WEIGHT.contact,
    hint: contactCount < 4 ? "Include name, email, phone, and location." : undefined,
  });
  score += contactPts;

  // Length
  const text = allText(data);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const lengthOk = wordCount >= 250 && wordCount <= 900;
  const lengthPts = lengthOk ? 10 : wordCount < 250 ? Math.round((wordCount / 250) * 10) : Math.max(0, 10 - Math.round((wordCount - 900) / 100));
  breakdown.push({
    label: "Length",
    score: lengthPts,
    max: 10,
    hint: wordCount < 250 ? `Too short (${wordCount} words). Aim for 250–900.` : wordCount > 900 ? `Too long (${wordCount} words). Trim to under 900.` : undefined,
  });
  score += lengthPts;

  // Keywords vs job description
  let matched: string[] = [];
  let missing: string[] = [];
  if (jobDescription.trim()) {
    const jdTokens = Array.from(new Set(tokenize(jobDescription)));
    const stop = new Set(["the", "and", "for", "with", "you", "our", "are", "this", "that", "have", "from", "will", "your", "their"]);
    const candidates = jdTokens.filter((t) => !stop.has(t)).slice(0, 30);
    matched = candidates.filter((t) => text.includes(t));
    missing = candidates.filter((t) => !text.includes(t));
    const kwPts = Math.round((matched.length / Math.max(candidates.length, 1)) * 5);
    breakdown.push({
      label: "Job keyword match",
      score: kwPts,
      max: 5,
      hint: missing.length ? `Try to include: ${missing.slice(0, 6).join(", ")}` : undefined,
    });
    score += kwPts;
  }

  return { score: Math.min(100, Math.round(score)), breakdown, matchedKeywords: matched, missingKeywords: missing, wordCount };
}

// Local placeholder for AI bullet improvement.
// TODO: replace with Lovable AI Gateway call when enabled.
export function improveBulletLocal(text: string): string {
  if (!text.trim()) return text;
  let t = text.trim();
  // Capitalize first letter
  t = t.charAt(0).toUpperCase() + t.slice(1);
  // Replace weak verbs with action verbs
  const swaps: [RegExp, string][] = [
    [/^worked on /i, "Delivered "],
    [/^helped /i, "Drove "],
    [/^responsible for /i, "Owned "],
    [/^did /i, "Executed "],
    [/^made /i, "Built "],
    [/\bteam\b/gi, "cross-functional team"],
  ];
  for (const [r, s] of swaps) t = t.replace(r, s);
  // Ensure ends with period
  if (!/[.!?]$/.test(t)) t += ".";
  // Suggest adding a metric if none present
  if (!/\d/.test(t)) t += " (Add a measurable result, e.g. % impact or users reached.)";
  return t;
}
