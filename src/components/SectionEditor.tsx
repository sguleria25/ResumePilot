import { Plus, Trash2, Upload, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResume } from "@/lib/resume-store";
import type { Section } from "@/lib/sections";
import { improveBulletLocal } from "@/lib/ats";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function SectionEditor({ section }: { section: Section }) {
  if (section === "personal") return <PersonalEditor />;
  if (section === "experience") return <ExperienceEditor />;
  if (section === "education") return <EducationEditor />;
  if (section === "projects") return <ProjectsEditor />;
  return <SkillsEditor />;
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Header({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b pb-4">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Card({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <div className="relative rounded-lg border bg-card p-5">
      {onRemove && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onRemove}
          className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      {children}
    </div>
  );
}

function PhotoUpload() {
  const photo = useResume((s) => s.photo);
  const setPhoto = useResume((s) => s.setPhoto);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file.");
    if (file.size > 2 * 1024 * 1024) return toast.error("Image must be under 2 MB.");
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-muted">
        {photo ? (
          <img src={photo} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <Upload className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Profile photo
        </Label>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
            <Upload className="mr-2 h-3.5 w-3.5" /> {photo ? "Replace" : "Upload"}
          </Button>
          {photo && (
            <Button size="sm" variant="ghost" onClick={() => setPhoto(undefined)}>
              <X className="mr-2 h-3.5 w-3.5" /> Remove
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
      </div>
    </div>
  );
}

function ImproveButton({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="h-7 px-2 text-xs text-accent hover:text-accent"
      onClick={() => {
        if (!value.trim()) return toast.info("Write something first, then click Improve.");
        const improved = improveBulletLocal(value);
        onChange(improved);
        toast.success("Bullet improved.");
      }}
    >
      <Sparkles className="mr-1 h-3 w-3" /> Improve with AI
    </Button>
  );
}

function PersonalEditor() {
  const personal = useResume((s) => s.personal);
  const setPersonal = useResume((s) => s.setPersonal);
  return (
    <div>
      <Header title="Personal" subtitle="The header of your resume." />
      <div className="mb-5">
        <PhotoUpload />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <Input value={personal.name} onChange={(e) => setPersonal({ name: e.target.value })} />
        </Field>
        <Field label="Title">
          <Input value={personal.title} onChange={(e) => setPersonal({ title: e.target.value })} />
        </Field>
        <Field label="Email">
          <Input value={personal.email} onChange={(e) => setPersonal({ email: e.target.value })} />
        </Field>
        <Field label="Phone">
          <Input value={personal.phone} onChange={(e) => setPersonal({ phone: e.target.value })} />
        </Field>
        <Field label="Location">
          <Input value={personal.location} onChange={(e) => setPersonal({ location: e.target.value })} />
        </Field>
        <Field label="Website">
          <Input value={personal.website} onChange={(e) => setPersonal({ website: e.target.value })} />
        </Field>
        <Field label="Summary" className="sm:col-span-2">
          <Textarea
            rows={4}
            value={personal.summary}
            onChange={(e) => setPersonal({ summary: e.target.value })}
          />
          <div className="mt-1 flex justify-end">
            <ImproveButton value={personal.summary} onChange={(v) => setPersonal({ summary: v })} />
          </div>
        </Field>
      </div>
    </div>
  );
}

function ExperienceEditor() {
  const list = useResume((s) => s.experience);
  const add = useResume((s) => s.addExperience);
  const update = useResume((s) => s.updateExperience);
  const remove = useResume((s) => s.removeExperience);
  return (
    <div>
      <Header
        title="Experience"
        subtitle="Your most recent roles, newest first."
        action={
          <Button onClick={add} variant="secondary">
            <Plus className="mr-2 h-4 w-4" /> Add role
          </Button>
        }
      />
      <div className="space-y-4">
        {list.map((e) => (
          <Card key={e.id} onRemove={() => remove(e.id)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Role">
                <Input value={e.role} onChange={(ev) => update(e.id, { role: ev.target.value })} />
              </Field>
              <Field label="Company">
                <Input value={e.company} onChange={(ev) => update(e.id, { company: ev.target.value })} />
              </Field>
              <Field label="Location">
                <Input value={e.location} onChange={(ev) => update(e.id, { location: ev.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start">
                  <Input value={e.start} onChange={(ev) => update(e.id, { start: ev.target.value })} />
                </Field>
                <Field label="End">
                  <Input value={e.end} onChange={(ev) => update(e.id, { end: ev.target.value })} />
                </Field>
              </div>
              <Field label="Details" className="sm:col-span-2">
                <Textarea
                  rows={3}
                  value={e.details}
                  onChange={(ev) => update(e.id, { details: ev.target.value })}
                />
                <div className="mt-1 flex justify-end">
                  <ImproveButton value={e.details} onChange={(v) => update(e.id, { details: v })} />
                </div>
              </Field>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EducationEditor() {
  const list = useResume((s) => s.education);
  const add = useResume((s) => s.addEducation);
  const update = useResume((s) => s.updateEducation);
  const remove = useResume((s) => s.removeEducation);
  return (
    <div>
      <Header
        title="Education"
        subtitle="Degrees and certifications."
        action={
          <Button onClick={add} variant="secondary">
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        }
      />
      <div className="space-y-4">
        {list.map((e) => (
          <Card key={e.id} onRemove={() => remove(e.id)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="School">
                <Input value={e.school} onChange={(ev) => update(e.id, { school: ev.target.value })} />
              </Field>
              <Field label="Degree">
                <Input value={e.degree} onChange={(ev) => update(e.id, { degree: ev.target.value })} />
              </Field>
              <Field label="Field of study">
                <Input value={e.field} onChange={(ev) => update(e.id, { field: ev.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start">
                  <Input value={e.start} onChange={(ev) => update(e.id, { start: ev.target.value })} />
                </Field>
                <Field label="End">
                  <Input value={e.end} onChange={(ev) => update(e.id, { end: ev.target.value })} />
                </Field>
              </div>
              <Field label="Details" className="sm:col-span-2">
                <Textarea
                  rows={2}
                  value={e.details}
                  onChange={(ev) => update(e.id, { details: ev.target.value })}
                />
              </Field>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProjectsEditor() {
  const list = useResume((s) => s.projects);
  const add = useResume((s) => s.addProject);
  const update = useResume((s) => s.updateProject);
  const remove = useResume((s) => s.removeProject);
  return (
    <div>
      <Header
        title="Projects"
        subtitle="Side projects and notable work."
        action={
          <Button onClick={add} variant="secondary">
            <Plus className="mr-2 h-4 w-4" /> Add project
          </Button>
        }
      />
      <div className="space-y-4">
        {list.map((p) => (
          <Card key={p.id} onRemove={() => remove(p.id)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name">
                <Input value={p.name} onChange={(ev) => update(p.id, { name: ev.target.value })} />
              </Field>
              <Field label="Link">
                <Input value={p.link} onChange={(ev) => update(p.id, { link: ev.target.value })} />
              </Field>
              <Field label="Tech" className="sm:col-span-2">
                <Input value={p.tech} onChange={(ev) => update(p.id, { tech: ev.target.value })} />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <Textarea
                  rows={3}
                  value={p.description}
                  onChange={(ev) => update(p.id, { description: ev.target.value })}
                />
                <div className="mt-1 flex justify-end">
                  <ImproveButton value={p.description} onChange={(v) => update(p.id, { description: v })} />
                </div>
              </Field>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SkillsEditor() {
  const skills = useResume((s) => s.skills);
  const setSkills = useResume((s) => s.setSkills);
  const [draft, setDraft] = useState("");

  const addSkill = () => {
    const v = draft.trim();
    if (!v) return;
    if (skills.includes(v)) return setDraft("");
    setSkills([...skills, v]);
    setDraft("");
  };

  return (
    <div>
      <Header title="Skills" subtitle="Press Enter to add. Click a chip to remove." />
      <div className="flex gap-2">
        <Input
          placeholder="e.g. TypeScript"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
        />
        <Button onClick={addSkill}>
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {skills.map((s) => (
          <button
            key={s}
            onClick={() => setSkills(skills.filter((x) => x !== s))}
            className="group inline-flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {s}
            <Trash2 className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
          </button>
        ))}
        {skills.length === 0 && (
          <p className="text-sm text-muted-foreground">No skills yet — add your first one above.</p>
        )}
      </div>
    </div>
  );
}
