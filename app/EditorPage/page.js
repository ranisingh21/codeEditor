
'use client';
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "../components/Navbar";
import CodeEditor from "../components/codeEditor";
import ProblemStatementViewer from "../components/problemStatement";

export default function Page() {
  const searchParams = useSearchParams();
  const problemId = searchParams.get("problemId");

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(false);
  const toggleTheme = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const res = await fetch("/api/proxy?type=problems");
        if (!res.ok) throw new Error("Failed to fetch problems list");
        const allProblems = await res.json();

        const found = Array.isArray(allProblems)
          ? allProblems.find(
              (p) =>
                String(p.id) === String(problemId) ||
                String(p.short_name) === String(problemId)
            )
          : null;

        setProblem(
          found || { id: problemId, short_name: problemId, name: `Sample Problem ${problemId}` }
        );
      } catch (err) {
        console.error(err);
        setProblem({ id: problemId, short_name: problemId, name: `Sample Problem ${problemId}` });
      } finally {
        setLoading(false);
      }
    }
    if (problemId) fetchProblem();
  }, [problemId]);

  const handleSubmissionDone = (result) => {
    console.log("📩 Submission done in parent Page:", result);
  };

  if (loading) return <p>Loading editor...</p>;
  if (!problem) return <p>No problem found</p>;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: darkMode ? "#121212" : "#f9f9f9",
        color: darkMode ? "#fff" : "#000",
        minHeight: "100vh",
      }}
    >
      <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />

      <div style={{ padding: "20px" }}>
        <Link href="/">
          <button
            style={{
              padding: "5px 10px",
              marginBottom: "20px",
              cursor: "pointer",
              borderRadius: "5px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
            }}
          >
            ← Back to Contest Page
          </button>
        </Link>

        <h1>
          Problem {problem.short_name}: {problem.name}
        </h1>
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <div style={{ flex: 1, maxWidth: "40%" }}>
            <ProblemStatementViewer problemId={problem.id} darkMode={darkMode} />
          </div>
          <div style={{ flex: 2 }}>
            <CodeEditor
              problemId={problem.id}
              problemShortName={problem.short_name}
              darkMode={darkMode}
              onSubmitted={handleSubmissionDone}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
