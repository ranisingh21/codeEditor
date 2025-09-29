'use client';
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiCopy, FiDownload } from 'react-icons/fi';
import Link from "next/link";

export default function SolutionPage() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("submissionId");

  const [submission, setSubmission] = useState(null);
  const [submissionCode, setSubmissionCode] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSubmission() {
      try {
        const res = await fetch(`/api/proxy?type=solution&submissionId=${submissionId}`);
        const data = await res.json();

        if (!data || data.error) {
          setError(data?.error || "Submission not found");
        } else {
          setSubmission(data);
          setSubmissionCode(data.code || {});
        }
      } catch (err) {
        setError(err.message || "Failed to load submission");
      } finally {
        setLoading(false);
      }
    }

    if (submissionId) loadSubmission();
  }, [submissionId]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("✅ Code copied to clipboard!");
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px", fontSize: "18px" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center", marginTop: "50px", fontWeight: "bold" }}>❌ Error: {error}</p>;

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        backgroundColor: "#eef1f6",  
        padding: "40px 20px"
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        
     <div style={{
  background: "linear-gradient(135deg,rgb(158, 52, 52), #f5f7fa)", 
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  padding: "30px"
}}>

          
          <Link href="submissionHistory">
            <button style={{ marginBottom: "25px",
              padding: "10px 22px",
              background: "green",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "15px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              transition: "all 0.3s ease" }}>
               🔙 Back
            </button>
          </Link>
          <div style={{
            background: "linear-gradient(135deg, #1f1f2e, #2a2a40)",
            color: "#fff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            marginBottom: "30px"
          }}>
            <h1 style={{ marginBottom: "12px", fontSize: "1.9rem", fontWeight: "bold" }}>Submission #{submission.id}</h1>
            <p><strong>Status:</strong> ✅ Correct Answer</p>
            <p><strong>Team:</strong> {submission.team_id}</p>
            <p><strong>Problem:</strong> {submission.problem_id || submission.problem}</p>
            <p><strong>Language:</strong> {submission.language_id}</p>
            <p><strong>Time:</strong> {submission.time}</p>
          </div>
          <h2 style={{ marginBottom: "18px", color: "#222", fontSize: "1.5rem", fontWeight: "600" }}>Solution Code</h2>
          
          {Object.keys(submissionCode).length === 0 ? (
            <p style={{ fontStyle: "italic", color: "#666" }}>No code available</p>
          ) : (
            Object.entries(submissionCode).map(([filename, content]) => (
              <div 
                key={filename} 
                style={{ 
                  marginBottom: "35px", 
                  borderRadius: "12px", 
                  overflow: "hidden", 
                  boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                  transition: "transform 0.2s"
                }}
                onMouseOver={e => e.currentTarget.style.transform = "translateY(-3px)"}
                onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{
                  backgroundColor: "#2c2c3c",
                  color: "#fff",
                  padding: "10px 15px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily: "monospace",
                  fontSize: "15px"
                }}>
                  <span>{filename}</span>
                  <div style={{ display: "flex", gap: "15px", fontSize: "18px" }}>
                    <FiCopy 
                      style={{ cursor: "pointer" }} 
                      onClick={() => copyToClipboard(content)} 
                      title="Copy code" 
                    />
                    <FiDownload
                      style={{ cursor: "pointer" }}
                      title="Download code"
                      onClick={() => {
                        const blob = new Blob([content], { type: "text/plain" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = filename;
                        link.click();
                      }}
                    />
                  </div>
                </div>
                <SyntaxHighlighter
                  language={submission.language_id?.toLowerCase() || "text"}
                  style={oneDark}
                  showLineNumbers
                  wrapLines
                  customStyle={{ fontSize: "14px", padding: "18px", margin: 0 }}
                >
                  {content}
                </SyntaxHighlighter>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
