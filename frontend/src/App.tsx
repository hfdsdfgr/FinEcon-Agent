import { useCallback, useEffect, useState } from "react";
import { api } from "./api/client";
import { useResearch } from "./hooks/useResearch";
import { WorkbenchLayout, pages } from "./layouts/WorkbenchLayout";
import type { Page } from "./layouts/WorkbenchLayout";
import { Workspace } from "./pages/Workspace";
import type { WorkspaceForm } from "./pages/Workspace";
import { Analysis } from "./pages/Analysis";
import { Diagnostics } from "./pages/Diagnostics";
import { Report } from "./pages/Report";
const readPage = (): Page => {
  const value = location.hash.slice(1);
  return pages.includes(value as Page) ? (value as Page) : "workspace";
};
export default function App() {
  const [page, setPage] = useState<Page>(readPage);
  const [health, setHealth] = useState("Checking");
  const research = useResearch();
  const [form, setForm] = useState<WorkspaceForm>({
    question: "",
    dependent: "",
    independent: [],
    method: "agent",
  });
  const checkHealth = useCallback(async () => {
    setHealth("Checking");
    try {
      const result = await api.health();
      setHealth(result.status === "ok" ? "Connected" : "Offline");
    } catch {
      setHealth("Offline");
    }
  }, []);
  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);
  useEffect(() => {
    const change = () => {
      if (location.hash === "#main") {
        document.getElementById("main")?.focus({ preventScroll: true });
        return;
      }
      setPage(readPage());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    document.title = `${page === "workspace" ? "Workspace" : page[0].toUpperCase() + page.slice(1)} · FinEcon`;
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [page]);
  function update(value: Partial<WorkspaceForm>) {
    if (research.busy) return;
    research.reset();
    setForm((previous) => ({ ...previous, ...value }));
  }
  return (
    <WorkbenchLayout
      page={page}
      research={research}
      health={health}
      checkHealth={() => void checkHealth()}
    >
      {page === "workspace" && (
        <Workspace
          form={form}
          update={update}
          research={research}
          openResults={() => {
            location.hash = "analysis";
          }}
        />
      )}{" "}
      {page === "analysis" && <Analysis research={research} />}{" "}
      {page === "diagnostics" && <Diagnostics />}{" "}
      {page === "report" && <Report research={research} />}
    </WorkbenchLayout>
  );
}
