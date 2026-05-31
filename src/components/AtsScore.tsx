import { useMemo, useState } from "react";
import { useResume } from "@/lib/resume-store";
import { analyzeResume } from "@/lib/ats";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Gauge } from "lucide-react";

export function AtsScore() {
  const data = useResume();
  const [jd, setJd] = useState("");
  const [open, setOpen] = useState(false);

  const result = useMemo(
    () =>
      analyzeResume(
        {
          template: data.template,
          photo: data.photo,
          personal: data.personal,
          education: data.education,
          experience: data.experience,
          projects: data.projects,
          skills: data.skills,
        },
        jd,
      ),
    [data, jd],
  );

  const color =
    result.score >= 80
      ? "text-emerald-600"
      : result.score >= 60
        ? "text-amber-600"
        : "text-destructive";

  return (
    <div className="mx-auto mb-4 w-full max-w-[760px] rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={"font-display text-2xl font-bold " + color}>{result.score}</span>
              <span className="text-xs text-muted-foreground">/ 100 ATS score</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {result.wordCount} words · {result.breakdown.filter((b) => b.hint).length} suggestions
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)}>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {open ? "Hide" : "Details"}
        </Button>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          <div className="space-y-2">
            {result.breakdown.map((b) => (
              <div key={b.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{b.label}</span>
                  <span className="text-muted-foreground">
                    {b.score}/{b.max}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(b.score / b.max) * 100}%` }}
                  />
                </div>
                {b.hint && <p className="mt-1 text-[11px] text-muted-foreground">{b.hint}</p>}
              </div>
            ))}
          </div>

          <div className="rounded-md border bg-background p-3">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Paste a job description to check keyword match
            </label>
            <Textarea
              rows={3}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="mt-2 text-xs"
              placeholder="Paste a job description here…"
            />
            {jd.trim() && (
              <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <p className="font-semibold text-emerald-600">Matched ({result.matchedKeywords.length})</p>
                  <p className="mt-1 text-muted-foreground">{result.matchedKeywords.slice(0, 12).join(", ") || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-destructive">Missing ({result.missingKeywords.length})</p>
                  <p className="mt-1 text-muted-foreground">{result.missingKeywords.slice(0, 12).join(", ") || "—"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
