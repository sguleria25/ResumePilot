import jsPDF from "jspdf";
import type { ResumeData } from "./resume-store";

type RGB = [number, number, number];
const NAVY: RGB = [15, 27, 61];
const ACCENT: RGB = [59, 111, 160];
const MUTED: RGB = [110, 120, 140];
const TEXT: RGB = [30, 35, 50];
const WHITE: RGB = [255, 255, 255];

export function generateResumePDF(data: ResumeData) {
  if (data.template === "modern") return renderModern(data);
  if (data.template === "minimal") return renderMinimal(data);
  return renderProfessional(data);
}

function saveAs(doc: jsPDF, data: ResumeData) {
  const fname = (data.personal.name || "resume").trim().replace(/\s+/g, "_") + ".pdf";
  doc.save(fname);
}

function addPhoto(doc: jsPDF, photo: string | undefined, x: number, y: number, size: number) {
  if (!photo) return;
  try {
    const fmt = photo.includes("image/png") ? "PNG" : "JPEG";
    doc.addImage(photo, fmt, x, y, size, size, undefined, "FAST");
  } catch {
    // ignore
  }
}

/* -------- Professional -------- */
function renderProfessional(data: ResumeData) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;
  const photoSize = 60;
  const hasPhoto = !!data.photo;
  const headerLeft = hasPhoto ? margin + photoSize + 14 : margin;
  const contentW = pageW - margin - headerLeft;

  const ensure = (n: number) => { if (y + n > pageH - margin) { doc.addPage(); y = margin; } };
  const text = (s: string, o: { size?: number; bold?: boolean; color?: RGB; x?: number; maxW?: number; gap?: number } = {}) => {
    const { size = 10, bold = false, color = TEXT, x = margin, maxW = pageW - margin * 2, gap = 2 } = o;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(s || "", maxW) as string[];
    const lh = size * 1.25;
    for (const l of lines) { ensure(lh); doc.text(l, x, y); y += lh; }
    y += gap;
  };
  const sectionTitle = (label: string) => {
    ensure(28); y += 6;
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...ACCENT);
    doc.text(label.toUpperCase(), margin, y); y += 6;
    doc.setDrawColor(...ACCENT); doc.setLineWidth(0.6); doc.line(margin, y, pageW - margin, y); y += 14;
  };
  const rowSplit = (l: string, r: string) => {
    ensure(14);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(...TEXT);
    doc.text(l, margin, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...MUTED);
    const rW = doc.getTextWidth(r); doc.text(r, pageW - margin - rW, y);
    y += 13;
  };

  // Header
  const { personal } = data;
  if (hasPhoto) addPhoto(doc, data.photo, margin, y, photoSize);
  const headerY = y;
  doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(...NAVY);
  doc.text(personal.name || "Your Name", headerLeft, headerY + 18);
  if (personal.title) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(...ACCENT);
    doc.text(personal.title, headerLeft, headerY + 34);
  }
  const contact = [personal.email, personal.phone, personal.location, personal.website].filter(Boolean).join("  •  ");
  if (contact) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...MUTED);
    const lines = doc.splitTextToSize(contact, contentW) as string[];
    lines.forEach((l, i) => doc.text(l, headerLeft, headerY + 48 + i * 11));
  }
  y = Math.max(headerY + (hasPhoto ? photoSize : 0), headerY + 56) + 10;
  doc.setDrawColor(...NAVY); doc.setLineWidth(1.2); doc.line(margin, y, pageW - margin, y); y += 14;

  if (personal.summary) text(personal.summary, { size: 10.5, gap: 4 });

  if (data.experience.length) {
    sectionTitle("Experience");
    data.experience.forEach((e) => {
      rowSplit(`${e.role}${e.company ? " · " + e.company : ""}`, `${e.start}${e.end ? " – " + e.end : ""}`);
      if (e.location) { doc.setFont("helvetica", "italic"); doc.setFontSize(9.5); doc.setTextColor(...MUTED); doc.text(e.location, margin, y); y += 12; }
      if (e.details) text(e.details, { size: 10, gap: 4 });
      y += 4;
    });
  }
  if (data.projects.length) {
    sectionTitle("Projects");
    data.projects.forEach((p) => {
      rowSplit(p.name, p.tech || "");
      if (p.link) { doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...ACCENT); doc.text(p.link, margin, y); y += 12; }
      if (p.description) text(p.description, { size: 10, gap: 4 });
      y += 4;
    });
  }
  if (data.education.length) {
    sectionTitle("Education");
    data.education.forEach((e) => {
      rowSplit(`${e.degree}${e.field ? ", " + e.field : ""}${e.school ? " · " + e.school : ""}`, `${e.start}${e.end ? " – " + e.end : ""}`);
      if (e.details) text(e.details, { size: 10, gap: 4 });
      y += 4;
    });
  }
  if (data.skills.length) { sectionTitle("Skills"); text(data.skills.join(" · "), { size: 10.5 }); }
  saveAs(doc, data);
}

/* -------- Modern (sidebar) -------- */
function renderModern(data: ResumeData) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const sidebarW = 200;
  const padding = 22;

  // Sidebar background (first page only)
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, sidebarW, pageH, "F");

  // Sidebar content
  let sy = padding + 8;
  if (data.photo) {
    const size = 86;
    addPhoto(doc, data.photo, (sidebarW - size) / 2, sy, size);
    sy += size + 14;
  }
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(...WHITE);
  const nameLines = doc.splitTextToSize(data.personal.name || "Your Name", sidebarW - padding * 2) as string[];
  nameLines.forEach((l) => { doc.text(l, padding, sy); sy += 18; });
  if (data.personal.title) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(220, 230, 245);
    const tl = doc.splitTextToSize(data.personal.title, sidebarW - padding * 2) as string[];
    tl.forEach((l) => { doc.text(l, padding, sy); sy += 13; });
  }
  sy += 10;
  doc.setFontSize(9); doc.setTextColor(220, 230, 245);
  for (const c of [data.personal.email, data.personal.phone, data.personal.location, data.personal.website]) {
    if (!c) continue;
    const ls = doc.splitTextToSize(c, sidebarW - padding * 2) as string[];
    ls.forEach((l) => { doc.text(l, padding, sy); sy += 12; });
  }
  const sideHeading = (label: string) => {
    sy += 14;
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(180, 200, 230);
    doc.text(label.toUpperCase(), padding, sy); sy += 12;
  };
  if (data.skills.length) {
    sideHeading("Skills");
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...WHITE);
    data.skills.forEach((s) => {
      const ls = doc.splitTextToSize("• " + s, sidebarW - padding * 2) as string[];
      ls.forEach((l) => { doc.text(l, padding, sy); sy += 12; });
    });
  }
  if (data.education.length) {
    sideHeading("Education");
    data.education.forEach((e) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...WHITE);
      const t = `${e.degree}${e.field ? ", " + e.field : ""}`;
      const ls = doc.splitTextToSize(t, sidebarW - padding * 2) as string[];
      ls.forEach((l) => { doc.text(l, padding, sy); sy += 12; });
      doc.setFont("helvetica", "normal"); doc.setTextColor(210, 220, 240);
      const sl = doc.splitTextToSize(e.school, sidebarW - padding * 2) as string[];
      sl.forEach((l) => { doc.text(l, padding, sy); sy += 11; });
      doc.setTextColor(170, 190, 220);
      doc.text(`${e.start}${e.end ? " – " + e.end : ""}`, padding, sy); sy += 14;
    });
  }

  // Main content
  const mainX = sidebarW + 28;
  const mainW = pageW - mainX - padding;
  let y = padding + 8;
  const ensure = (n: number) => { if (y + n > pageH - padding) { doc.addPage(); y = padding + 8; } };
  const text = (s: string, o: { size?: number; bold?: boolean; color?: RGB; gap?: number } = {}) => {
    const { size = 10, bold = false, color = TEXT, gap = 2 } = o;
    doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(s || "", mainW) as string[];
    const lh = size * 1.3;
    for (const l of lines) { ensure(lh); doc.text(l, mainX, y); y += lh; }
    y += gap;
  };
  const head = (l: string) => { ensure(20); y += 6; doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...NAVY); doc.text(l.toUpperCase(), mainX, y); y += 12; };

  if (data.personal.summary) { head("Profile"); text(data.personal.summary, { size: 10.5, gap: 6 }); }
  if (data.experience.length) {
    head("Experience");
    data.experience.forEach((e) => {
      ensure(16);
      doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(...TEXT);
      doc.text(e.role, mainX, y);
      const range = `${e.start}${e.end ? " – " + e.end : ""}`;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...MUTED);
      const rw = doc.getTextWidth(range); doc.text(range, mainX + mainW - rw, y);
      y += 13;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...ACCENT);
      doc.text(`${e.company}${e.location ? " · " + e.location : ""}`, mainX, y); y += 12;
      if (e.details) text(e.details, { size: 10, gap: 4 });
      y += 4;
    });
  }
  if (data.projects.length) {
    head("Projects");
    data.projects.forEach((p) => {
      ensure(16);
      doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(...TEXT);
      doc.text(p.name || "", mainX, y);
      if (p.tech) {
        doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...MUTED);
        const rw = doc.getTextWidth(p.tech); doc.text(p.tech, mainX + mainW - rw, y);
      }
      y += 13;
      if (p.link) { doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(...ACCENT); doc.text(p.link, mainX, y); y += 11; }
      if (p.description) text(p.description, { size: 10, gap: 4 });
      y += 4;
    });
  }
  saveAs(doc, data);
}

/* -------- Minimal -------- */
function renderMinimal(data: ResumeData) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 64;
  let y = margin;
  const ensure = (n: number) => { if (y + n > pageH - margin) { doc.addPage(); y = margin; } };
  const center = (s: string, size: number, color: RGB, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(size); doc.setTextColor(...color);
    const w = doc.getTextWidth(s);
    ensure(size * 1.3); doc.text(s, (pageW - w) / 2, y); y += size * 1.3;
  };

  if (data.photo) {
    const size = 54; addPhoto(doc, data.photo, (pageW - size) / 2, y, size); y += size + 10;
  }
  center(data.personal.name || "Your Name", 20, TEXT, true);
  if (data.personal.title) center(data.personal.title, 11, MUTED);
  const contact = [data.personal.email, data.personal.phone, data.personal.location, data.personal.website].filter(Boolean).join("  ·  ");
  if (contact) { y += 4; center(contact, 9, MUTED); }
  y += 10;

  if (data.personal.summary) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(...TEXT);
    const lines = doc.splitTextToSize(data.personal.summary, pageW - margin * 2 - 40) as string[];
    lines.forEach((l) => { ensure(14); const w = doc.getTextWidth(l); doc.text(l, (pageW - w) / 2, y); y += 14; });
    y += 6;
  }

  const head = (l: string) => {
    y += 14; doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...MUTED);
    const txt = l.toUpperCase().split("").join(" ");
    const w = doc.getTextWidth(txt); ensure(20); doc.text(txt, (pageW - w) / 2, y); y += 14;
  };
  const row = (left: string, title: string, body?: string) => {
    ensure(20);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...MUTED);
    doc.text(left, margin, y);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(...TEXT);
    doc.text(title, margin + 90, y);
    y += 13;
    if (body) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...MUTED);
      const lines = doc.splitTextToSize(body, pageW - margin - (margin + 90)) as string[];
      lines.forEach((l) => { ensure(13); doc.text(l, margin + 90, y); y += 12; });
    }
    y += 6;
  };

  if (data.experience.length) {
    head("Experience");
    data.experience.forEach((e) => row(`${e.start}${e.end ? " – " + e.end : ""}`, `${e.role}${e.company ? " · " + e.company : ""}`, e.details));
  }
  if (data.projects.length) { head("Projects"); data.projects.forEach((p) => row(p.tech || "", p.name, p.description)); }
  if (data.education.length) {
    head("Education");
    data.education.forEach((e) => row(`${e.start}${e.end ? " – " + e.end : ""}`, `${e.degree}${e.field ? ", " + e.field : ""} — ${e.school}`, e.details));
  }
  if (data.skills.length) { head("Skills"); center(data.skills.join("   ·   "), 10, MUTED); }
  saveAs(doc, data);
}
