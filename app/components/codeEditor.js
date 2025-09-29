'use client';
import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { githubLight } from '@uiw/codemirror-theme-github';
import Link from 'next/link';

export default function CodeEditor({ problemId, darkMode }) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [submissionInfo, setSubmissionInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [previousSubmissions, setPreviousSubmissions] = useState(() => {
    const saved = localStorage.getItem('previousSubmissions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
  if (previousSubmissions.length > 0) {
   setSubmissionInfo(previousSubmissions[0]);
  const latest = previousSubmissions[0];
   setSubmissionInfo(latest);
   if (!latest.verdict || latest.verdict.includes("Pending")) {
    pollVerdict(latest.submissionId);
   }
  }
}, []);

  useEffect(() => {
    if (problemId) setCode(getStarterCode(language));
  }, [language, problemId]);

  const getStarterCode = (lang) => {
    switch (lang) {
      case 'python':
        return `n = int(input())\nprint(n)`;
      case 'cpp':
        return `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    cout << n;\n    return 0;\n}`;
      case 'c':
        return `#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    printf("%d", n);\n    return 0;\n}`;
      case 'java':
        return `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(n);\n    }\n}`;
      case 'javascript':
        return `const input = require('fs').readFileSync(0, 'utf8').trim();\nconsole.log(parseInt(input));`;
      case 'html':
        return `<!DOCTYPE html>\n<html>\n<head><title>Input Output</title></head>\n<body>\n  <input id="num" type="number" />\n  <button onclick="alert(document.getElementById('num').value)">Print Number</button>\n</body>\n</html>`;
      default:
        return '// Write your code here';
    }
  };

  const getExtension = () => {
    switch (language) {
      case 'javascript': return javascript();
      case 'python': return python();
      case 'cpp': return cpp();
      case 'java': return java();
      default: return javascript();
    }
  };

  const getDomJudgeLang = () => {
    switch (language) {
      case 'python': return 'python3';
      case 'cpp': return 'cpp';
      case 'c': return 'c';
      case 'java': return 'java';
      case 'javascript': return 'javascript';
      default: return 'python3';
    }
  };

  const getFileName = () => {
    switch (language) {
      case 'python': return 'solution.py';
      case 'cpp': return 'solution.cpp';
      case 'c': return 'solution.c';
      case 'java': return 'Main.java';
      case 'javascript': return 'solution.js';
      default: return 'solution.txt';
    }
  };

  const verdictMap = {
    AC: "✅ Accepted",
    WA: "❌ Wrong Answer",
    TLE: "⏱ Time Limit Exceeded",
    RE: "⚠ Runtime Error",
    CE: "📄 Compilation Error",
    CORRECT: "✅ Accepted",
    "WRONG-ANSWER": "❌ Wrong Answer",
  };

  const pollVerdict = (submissionId) => {
    let attempts = 0;
    const maxAttempts = 120; 

    const interval = setInterval(async () => {
      try {
        const subRes = await fetch(`/api/proxy?type=solution&submissionId=${submissionId}`, {
          cache: "no-store",
        });
        const submissionData = await subRes.json();

        console.log("📦 Submission metadata:", submissionData);
        const res = await fetch("/api/proxy?type=judgements", { cache: "no-store" });
        const data = await res.json();

        const j = Array.isArray(data)
          ? data.find((x) => String(x.submission_id) === String(submissionId))
          : null;

        if (j) {
          let status = j.status ?? (j.finished === true ? "finished" : "processing");
          let judgementCode = j.judgement_type_id ?? null; 

          let verdict = "⏳ Pending...";
          let runtime = "Pending...";

          if (judgementCode) {
            verdict = judgementCode;
          }

          if (j.runtime || j.max_run_time) {
            runtime = j.runtime ?? j.max_run_time;
          }

          const latest = {
            submissionId,
            judgementId: j.id ?? "Pending...",
            status,
            verdict,
            runtime,
          };

          setSubmissionInfo(latest);
          setPreviousSubmissions([latest]);
          localStorage.setItem('previousSubmissions', JSON.stringify([latest]));

          if (judgementCode) {
            clearInterval(interval);
            console.log(`✅ Final verdict for ${submissionId}: ${judgementCode}, status: ${status}`);
          }
        } else {
          console.log(`⚠ No judgement yet for submission ${submissionId}`);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }

      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        const timeout = {
          submissionId,
          judgementId: "N/A",
          status: "Timeout",
          verdict: "⚠ No verdict received",
          runtime: "N/A",
        };
        setSubmissionInfo(timeout);
        setPreviousSubmissions([timeout]);
        localStorage.setItem('previousSubmissions', JSON.stringify([timeout]));
      }
    }, 2000);
  };

  const submitCodeToDOMJudge = async () => {
    if (!problemId) {
      alert('⚠ No problem selected!');
      return;
    }

    const formdata = new FormData();
    formdata.append("problem", problemId);
    formdata.append("language", getDomJudgeLang());
    formdata.append("code", new Blob([code], { type: "text/plain" }), getFileName());
    formdata.append("entry_point", getFileName());

    console.log("🚀 Submitting:", {
      problem: problemId,
      language: getDomJudgeLang(),
      file: getFileName()
    });

    setLoading(true);
    setSubmissionInfo(null);

    try {
      const response = await fetch("/api/proxy", { method: "POST", body: formdata });

      let result;
      try {
        result = await response.json();
      } catch {
        const text = await response.text();
        result = { error: text };
      }
      console.log("✅ Submission Response:", result);

      const newSubmission = {
        problemId: problemId,
        submissionId: result.submissionId || result.submission_id,
        judgementId: null,
        status: "Pending",
        verdict: "⏳ Waiting...",
        runtime: "N/A",
      };

      setSubmissionInfo(newSubmission);
      pollVerdict(newSubmission.submissionId);
      const updatedPrevious = [newSubmission];
      setPreviousSubmissions(updatedPrevious);
      localStorage.setItem('previousSubmissions', JSON.stringify(updatedPrevious));

      alert("✅ Submission Sent! Verdict will update shortly.");
    } catch (error) {
      console.error("❌ Submission failed:", error);
      alert("❌ Network or server error!");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictStyle = (verdict) => {
    if (!verdict) return {};
    const v = verdict.toLowerCase();
    if (v.includes('accepted') || v.includes('ac')) return { color: 'green', fontWeight: 'bold' };
    if (v.includes('wrong') || v.includes('wa') || v.includes('tle') || v.includes('re')) return { color: 'red', fontWeight: 'bold' };
    return { color: 'orange', fontWeight: 'bold' };
  };

  return (
    <div style={{
      padding: '20px',
      width: '800px',
      border: darkMode ? '1px solid #333' : '1px solid #ddd',
      borderRadius: '12px',
      backgroundColor: darkMode ? '#1e1e1e' : '#f9f9f9',
      color: darkMode ? '#e0e0e0' : '#000',
      boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
      marginLeft: '269px',
      transition: 'all 0.3s ease'
    }}>
      <label htmlFor="language" style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', fontSize: '16px' }}>Select Language:</label>
      <select
        id="language"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          marginBottom: '20px',
          padding: '10px 12px',
          fontSize: '16px',
          borderRadius: '6px',
          border: darkMode ? '1px solid #444' : '1px solid #ccc',
          backgroundColor: darkMode ? '#2d2d2d' : '#fff',
          color: darkMode ? '#e0e0e0' : '#000',
          outline: 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
        <option value="c">C</option>
        <option value="java">Java</option>
      </select>

      <CodeMirror
        value={code}
        theme={darkMode ? dracula : githubLight}
        extensions={[getExtension()]}
        onChange={(value) => setCode(value)}
        height="600px"
        style={{
          width: '100%',
          borderRadius: '8px',
          border: darkMode ? '1px solid #444' : '1px solid #ddd',
          overflow: 'hidden'
        }}
      />

      <div style={{ textAlign: 'right', marginTop: '20px' }}>
        <button onClick={submitCodeToDOMJudge} style={{
          padding: '10px 20px',
          fontSize: '16px',
          borderRadius: '6px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '12px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease'
        }}>Submit</button>
        <br />
        <br />
        <select
          disabled={!problemId}
          defaultValue=""
          onChange={(e) => {
            if (!e.target.value) return;
            if (problemId) {
              if (e.target.value === "all") {
                window.location.href = `/submissionHistory?problemId=${problemId}`;
              } else if (e.target.value === "mine") {
                window.location.href = `/submissionHistory?problemId=${problemId}&filter=mine`;
              }
            }
          }}
          style={{
            marginTop: '12px',
            padding: '10px 12px',
            fontSize: '16px',
            borderRadius: '6px',
            border: darkMode ? '1px solid #444' : '1px solid #ccc',
            backgroundColor: darkMode ? '#2d2d2d' : '#fff',
            color: darkMode ? '#e0e0e0' : '#000',
            outline: 'none',
            cursor: problemId ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease'
          }}
        >
          <option value="">View Submissions</option>
          <option value="all">All Submissions</option>
          <option value="mine">My Submissions</option>
        </select>
      </div>

      {submissionInfo || loading ? (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Latest Submission Status</h3>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)'
          }}>
           <thead>
  <tr style={{ backgroundColor: darkMode ? '#1f2937' : 'grey' }}>
    <th style={{ ...thStyle, color: darkMode ? '#e5e7eb' : 'black' }}>Submission ID</th>
    <th style={{ ...thStyle, color: darkMode ? '#e5e7eb' : 'black' }}>Judgement ID</th>
    <th style={{ ...thStyle, color: darkMode ? '#e5e7eb' : 'black' }}>Status</th>
    <th style={{ ...thStyle, color: darkMode ? '#e5e7eb' : 'black' }}>Verdict</th>
    <th style={{ ...thStyle, color: darkMode ? '#e5e7eb' : 'black' }}>Runtime (sec)</th>
  </tr>
</thead>

            <tbody>
              <tr style={{ borderBottom: darkMode ? '1px solid #444' : '1px solid #ddd' }}>
                <td style={{ ...tdStyle }}>{loading ? 'Pending...' : submissionInfo?.submissionId}</td>
                <td style={{ ...tdStyle }}>{loading ? 'Pending...' : submissionInfo?.judgementId}</td>
                              <td style={{ ...tdStyle }}>
                  {loading
                    ? "Pending..."
                    : submissionInfo?.status === "Timeout"
                      ? "⚠ Not Evaluated (Timeout)"
                      : submissionInfo?.verdict && submissionInfo?.runtime && submissionInfo?.verdict !== "Pending..."
                        ? "✅ Evaluated"
                        : "Pending..."}
                </td>

                <td
                  style={{
                    ...tdStyle,
                    ...(submissionInfo
                      ? getVerdictStyle(submissionInfo.verdict)
                      : { color: 'orange', fontWeight: 'bold' }),
                  }}
                >
                  {loading ? 'Pending...' : submissionInfo?.verdict}
                </td>
                <td style={{ ...tdStyle }}>{loading ? 'Pending...' : submissionInfo?.runtime}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

const thStyle = { padding: '12px', fontWeight: 'bold' };
const tdStyle = { padding: '12px' };
