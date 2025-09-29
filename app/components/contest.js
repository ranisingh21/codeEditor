
'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function ContestPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [darkMode, setDarkMode] = useState(false);
  const toggleTheme = () => setDarkMode((prev) => !prev);

  const authHeader =
    "Basic " + Buffer.from("rani:rani@justuju.in").toString("base64");

  useEffect(() => {
    async function fetchProblems() {
      try {
        const res = await fetch("/api/proxy?type=problems", {
          headers: { Authorization: authHeader },
        });
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();

        const normalized = Array.isArray(data)
          ? data.map((p) => ({
              id: p.id,
              name: p.name || "Unnamed Problem",
              code: p.code || p.short_name || "N/A",
              totalSubmissions:
                p.total_submissions || p.submissions || 0, 
              successfulSubmissions:
                p.accepted_submissions || p.successful_submissions || 0, 
              accuracy: p.accuracy || p.success_rate || 0,
            }))
          : data.problems?.map((p) => ({
              id: p.id,
              name: p.name || "Unnamed Problem",
              code: p.code || p.short_name || "N/A",
              totalSubmissions:
                p.total_submissions || p.submissions || 0,
              successfulSubmissions:
                p.accepted_submissions || p.successful_submissions || 0,
              accuracy: p.accuracy || p.success_rate || 0,
            })) || [];

        setProblems(
          normalized.length > 0
            ? normalized
            : [
                {
                  id: 1,
                  name: "Sample Problem 1",
                  code: "PROB1",
                  totalSubmissions: 1234,
                  successfulSubmissions: 876,
                  accuracy: 87.5,
                },
                {
                  id: 2,
                  name: "Sample Problem 2",
                  code: "PROB2",
                  totalSubmissions: 567,
                  successfulSubmissions: 259,
                  accuracy: 45.6,
                },
              ]
        );
      } catch (err) {
        console.error(err);
        setError("Could not fetch problems. Using mock data.");
        setProblems([
          {
            id: 1,
            name: "Sample Problem 1",
            code: "PROB1",
            totalSubmissions: 1234,
            successfulSubmissions: 876,
            accuracy: 87.5,
          },
          {
            id: 2,
            name: "Sample Problem 2",
            code: "PROB2",
            totalSubmissions: 567,
            successfulSubmissions: 259,
            accuracy: 45.6,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
  }, []);

  if (loading) return <p>Loading problems...</p>;

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

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "30px",
          marginBottom: "40px",
        }}
      >
        <img
          src="https://ahmadrosid.com/images/codemirror-with-nextjs.png"
          alt="Contest Banner"
          style={{
            width: "90%",
            maxWidth: "950px",
            height: "250px",
            objectFit: "cover",
            borderRadius: "12px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
          }}
        />
      </div>

      <div style={{ padding: "20px" }}>
        <h2
          style={{ marginBottom: "15px", fontSize: "20px", fontWeight: "bold" }}
        >
          Contest Problems
        </h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            borderRadius: "10px",
            overflow: "hidden",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            boxShadow: darkMode
              ? "0 4px 10px rgba(0,0,0,0.6)"
              : "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: darkMode ? "#2a2a2a" : "#f1f1f1",
                color: darkMode ? "#ddd" : "#000",
                fontWeight: "600",
              }}
            >
              <th style={{ padding: "12px", textAlign: "center" }}>#</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Code</th>
              <th style={{ padding: "12px", textAlign: "center" }}>
                Total Submissions
              </th>
              <th style={{ padding: "12px", textAlign: "center" }}>
                Successful Submissions
              </th>
              <th style={{ padding: "12px", textAlign: "center" }}>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem, index) => (
              <tr
                key={problem.id}
                style={{
                  backgroundColor: darkMode
                    ? index % 2 === 0
                      ? "#242424"
                      : "#1a1a1a"
                    : index % 2 === 0
                    ? "#f9f9f9"
                    : "#fff",
                  transition: "0.3s",
                }}
              >
                <td
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {index + 1}
                </td>
                <td style={{ padding: "12px", fontWeight: "500" }}>
                  <Link
                    href={`/EditorPage?problemId=${problem.id}`}
                    style={{
                      color: darkMode ? "#4da6ff" : "#007bff",
                      textDecoration: "none",
                    }}
                  >
                    {problem.name}
                  </Link>
                </td>
                <td style={{ padding: "12px", fontFamily: "monospace" }}>
                  {problem.code || "N/A"}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {problem.totalSubmissions ?? 0}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {problem.successfulSubmissions ?? 0}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <span style={{ color: "#007bff", fontWeight: "600" }}>
                    {(problem.accuracy ?? 0).toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
