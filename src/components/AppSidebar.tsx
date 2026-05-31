import {
  User, GraduationCap, Briefcase, FolderGit2, Sparkles, FileText,
  Download, RotateCcw, Plus, Copy, Trash2, Files, Palette, Check,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Section } from "@/lib/sections";
import { useResume, type TemplateId } from "@/lib/resume-store";
import { generateResumePDF } from "@/lib/pdf-generator";

const items: { id: Section; label: string; icon: typeof User }[] = [
  { id: "personal", label: "Personal", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "skills", label: "Skills", icon: Sparkles },
];

const templates: { id: TemplateId; label: string; desc: string }[] = [
  { id: "professional", label: "Professional", desc: "Classic navy header" },
  { id: "modern", label: "Modern", desc: "Two-column sidebar" },
  { id: "minimal", label: "Minimal", desc: "Centered, airy" },
];

export function AppSidebar({
  active,
  onSelect,
}: {
  active: Section;
  onSelect: (s: Section) => void;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const data = useResume();
  const reset = useResume((s) => s.reset);
  const resumes = useResume((s) => s.resumes);
  const activeId = useResume((s) => s.activeId);
  const switchResume = useResume((s) => s.switchResume);
  const createResume = useResume((s) => s.createResume);
  const renameResume = useResume((s) => s.renameResume);
  const removeResume = useResume((s) => s.removeResume);
  const duplicateResume = useResume((s) => s.duplicateResume);
  const setTemplate = useResume((s) => s.setTemplate);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <FileText className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display text-sm font-semibold text-sidebar-foreground">
                Resumé Studio
              </span>
              <span className="text-[11px] text-sidebar-foreground/60">Build · Preview · Export</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <Files className="h-3 w-3" /> My resumes
              </span>
              <button
                onClick={() => createResume("Untitled Resume")}
                className="rounded p-0.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                title="New resume"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <div className="space-y-1">
                {resumes.map((r) => (
                  <div
                    key={r.id}
                    className={
                      "group flex items-center gap-1 rounded-md border px-1.5 py-1 transition " +
                      (r.id === activeId
                        ? "border-sidebar-primary/40 bg-sidebar-accent"
                        : "border-transparent hover:bg-sidebar-accent/60")
                    }
                  >
                    <button
                      onClick={() => switchResume(r.id)}
                      className="flex flex-1 items-center gap-1.5 truncate text-left"
                    >
                      {r.id === activeId ? (
                        <Check className="h-3 w-3 text-sidebar-primary" />
                      ) : (
                        <span className="h-3 w-3" />
                      )}
                      <Input
                        value={r.label}
                        onChange={(e) => renameResume(r.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-6 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-1"
                      />
                    </button>
                    <button
                      onClick={() => duplicateResume(r.id)}
                      className="opacity-0 transition hover:text-sidebar-primary group-hover:opacity-100"
                      title="Duplicate"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    {resumes.length > 1 && (
                      <button
                        onClick={() => removeResume(r.id)}
                        className="opacity-0 transition hover:text-destructive group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Sections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.id}>
                  <SidebarMenuButton
                    isActive={active === it.id}
                    onClick={() => onSelect(it.id)}
                    tooltip={it.label}
                  >
                    <it.icon className="h-4 w-4" />
                    <span>{it.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="inline-flex items-center gap-1.5">
              <Palette className="h-3 w-3" /> Template
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <div className="space-y-1">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={
                      "flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left text-xs transition " +
                      (data.template === t.id
                        ? "border-sidebar-primary/40 bg-sidebar-accent"
                        : "border-transparent hover:bg-sidebar-accent/60")
                    }
                  >
                    <div>
                      <p className="font-medium text-sidebar-foreground">{t.label}</p>
                      <p className="text-[10px] text-sidebar-foreground/60">{t.desc}</p>
                    </div>
                    {data.template === t.id && <Check className="h-3.5 w-3.5 text-sidebar-primary" />}
                  </button>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="flex flex-col gap-2 p-2">
            <Button
              onClick={() => generateResumePDF(data)}
              className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            >
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm("Reset this resume to sample data?")) reset();
              }}
              className="w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-2">
            <Button
              size="icon"
              onClick={() => generateResumePDF(data)}
              className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
