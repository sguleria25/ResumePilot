import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Eye, Pencil } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SectionEditor } from "@/components/SectionEditor";
import { ResumePreview } from "@/components/ResumePreview";
import { AtsScore } from "@/components/AtsScore";
import { Button } from "@/components/ui/button";
import { useResume } from "@/lib/resume-store";
import { generateResumePDF } from "@/lib/pdf-generator";
import type { Section } from "@/lib/sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resumé Studio — Build a polished PDF resume" },
      {
        name: "description",
        content:
          "A focused resume builder. Fill in your details and export a typeset PDF in seconds.",
      },
      { property: "og:title", content: "Resumé Studio" },
      {
        property: "og:description",
        content: "Build a polished, professional resume and export to PDF.",
      },
    ],
  }),
  component: Builder,
});

function Builder() {
  const [section, setSection] = useState<Section>("personal");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const data = useResume();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full max-w-full overflow-hidden bg-background">
        <AppSidebar active={section} onSelect={setSection} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur">
            <div className="flex items-center gap-2">
              <SidebarTrigger />

              <div className="hidden sm:block">
                <h1 className="font-display text-sm font-semibold">
                  Resumé Studio
                </h1>
                <p className="text-[11px] text-muted-foreground">
                  Edits autosave to this browser.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-md border bg-secondary p-0.5 lg:hidden">
                <button
                  onClick={() => setMobileView("edit")}
                  className={
                    "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition " +
                    (mobileView === "edit"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground")
                  }
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>

                <button
                  onClick={() => setMobileView("preview")}
                  className={
                    "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition " +
                    (mobileView === "preview"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground")
                  }
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </button>
              </div>

              <Button onClick={() => generateResumePDF(data)} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </header>

          <main className="grid flex-1 min-w-0 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
            <div
              className={
                "border-r bg-background p-6 lg:p-8 " +
                (mobileView === "edit" ? "block" : "hidden lg:block")
              }
            >
              <div className="mx-auto max-w-2xl">
                <SectionEditor section={section} />
              </div>
            </div>

            <div
              className={
                "overflow-auto bg-muted/40 p-4 lg:p-6 " +
                (mobileView === "preview" ? "block" : "hidden lg:block")
              }
            >
              <div className="mx-auto mb-6 max-w-3xl">
                <AtsScore />
              </div>

              <div className="flex justify-center">
                <div className="origin-top scale-[0.85]">
                  <ResumePreview />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}