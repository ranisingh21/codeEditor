
// 'use client';
// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import Link from "next/link";
// import Navbar from "../components/Navbar"; 

// export default function SubmissionsPage() {
//   const searchParams = useSearchParams();
//   const problemIdParam = searchParams.get("problemId");
//   const filter = searchParams.get("filter") || "all";

//   const [submissions, setSubmissions] = useState([]);
//   const [teams, setTeams] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [tick, setTick] = useState(0);

//   const [darkMode, setDarkMode] = useState(false);
//   const toggleTheme = () => setDarkMode((prev) => !prev);

//   const verdictMap = {
//     AC: { label: "Accepted", color: "#28a745" },
//     WA: { label: "Wrong Answer", color: "#dc3545" },
//     TLE: { label: "Time Limit Exceeded", color: "#ffc107" },
//     MLE: { label: "Memory Limit Exceeded", color: "#17a2b8" },
//     RE: { label: "Runtime Error", color: "#fd7e14" },
//     CE: { label: "Compilation Error", color: "#6c757d" },
//     NO: { label: "Pending", color: "#007bff" },
//   };

//   const myTeamId = 42;

//   function formatTimeAgo(dateStr) {
//     if (!dateStr) return "-";
//     const now = new Date();
//     const date = new Date(dateStr);
//     const diff = Math.floor((now - date) / 1000);

//     if (diff < 60) return `${diff}s ago`;
//     if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
//     if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
//     return `${Math.floor(diff / 86400)}d ago`;
//   }

//   async function fetchSubmissions() {
//     try {
//       const subsRes = await fetch("/api/proxy?type=submissions");
//       let subsData = await subsRes.json();
//       subsData = Array.isArray(subsData) ? subsData : subsData.submissions || [];

//       if (problemIdParam) {
//         subsData = subsData.filter(
//           (s) => String(s.problem_id || s.problem) === String(problemIdParam)
//         );
//       }

//       const judgeRes = await fetch("/api/proxy?type=judgements");
//       let judgeData = await judgeRes.json();
//       judgeData = Array.isArray(judgeData) ? judgeData : judgeData.judgements || [];

//       const teamsRes = await fetch("/api/proxy?type=teams");
//       const teamsData = await teamsRes.json();
//       const teamsMap = {};
//       teamsData.forEach((t) => {
//         teamsMap[String(t.id)] = t.display_name || t.name || t.icpc_id;
//       });
//       setTeams(teamsMap);

//       const merged = subsData.map((s) => {
//         const sId = String(s.id);
//         const j = judgeData.find(j => {
//           let jid = j.submission_id;
//           if (typeof jid === "object" && jid !== null) jid = jid.id;
//           return String(jid) === sId;
//         });

//         return {
//           ...s,
//           verdict: j ? verdictMap[j.judgement_type_id]?.label || j.judgement_type_id : "Pending",
//           verdictColor: j ? verdictMap[j.judgement_type_id]?.color || "#000" : "#007bff",
//           max_run_time: j?.max_run_time ?? "-",
//           start_time: j?.start_time ?? "-",
//           end_time: j?.end_time ?? "-",
//           teamName: teamsMap[String(s.team_id ?? s.team?.id)] || "Unknown"
//         };
//       });

//       merged.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
//       setSubmissions(merged);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchSubmissions();
//     const interval = setInterval(fetchSubmissions, 5000);
//     return () => clearInterval(interval);
//   }, [problemIdParam]);

//   useEffect(() => {
//     const interval = setInterval(() => setTick(prev => prev + 1), 1000);
//     return () => clearInterval(interval);
//   }, []);

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

//   const filteredSubmissions =
//     filter === "mine"
//       ? submissions.filter(s => String(s.team_id ?? s.team?.id) === String(myTeamId))
//       : submissions;

//   return (
//     <div
//       style={{
//         fontFamily: "Arial, sans-serif",
//         backgroundColor: darkMode ? "#121212" : "#f5f5f5",
//         color: darkMode ? "#fff" : "#000",
//         minHeight: "100vh",
//       }}
//     >
//       <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />

//       <div style={{ padding: "20px" }}>
//         <h1 style={{ marginBottom: "20px" }}>
//           {filter === "mine" ? "My Submissions" : "All Submissions"}
//         </h1>
    
//     <Link href={`/EditorPage?problemId=${problemIdParam}`}>
//               <button 
//                 style={{
//                   marginLeft: "10px",
//                   padding: "5px 10px",
//                   cursor: "pointer",
//                   backgroundColor: "green",
//                   color: "#fff",
//                   border: "none",
//                   borderRadius: "5px"
//                 }}
//               >
//                 🔙 Back to Code Editor
//               </button>
//             </Link>
//         {problemIdParam && (
          
//           <p>
//             {filter === "mine" ? "only my submissions" : "all submissions"} for{" "}
//             <strong>Problem {problemIdParam}</strong>{" "}
            
//           </p>
//         )}

//         <table
//           style={{
//             width: "100%",
//             borderCollapse: "collapse",
//             marginTop: "20px",
//             borderRadius: "10px",
//             overflow: "hidden",
//             backgroundColor: darkMode ? "#1e1e1e" : "#fff",
//             boxShadow: darkMode
//               ? "0 4px 10px rgba(0,0,0,0.6)"
//               : "0 4px 12px rgba(0,0,0,0.1)",
//           }}
//         >
//           <thead>
//             <tr
//               style={{
//                 backgroundColor: darkMode ? "#2a2a2a" : "#f0f0f0",
//                 color: darkMode ? "#ddd" : "#333",
//               }}
//             >
//           {[
//   "Submission ID",
//   "Team/User Name",
//   "Problem ID",
//   "Language",
//   "Time",
//   "Verdict",
//   "Max Run Time",
//   "Start Time",
//   "End Time",
//   "Solution",
// ].map((h) => (
//   <th
//     key={h}
//     style={{
//       borderBottom: darkMode ? "1px solid #444" : "1px solid #ddd",
//       padding: "12px",
//       textAlign: "left",
//       backgroundColor: darkMode ? "#2a2a2a" : "grey", 
//       color: darkMode ? "#ddd" : "#fff", 
//       fontWeight: "600",
//       color: "black",
//     }}
//   >
//     {h}
//   </th>
// ))}

//             </tr>
            
//           </thead>
//           <tbody>
//             {filteredSubmissions.map((s, index) => (
//               <tr
//                 key={s.id}
//                 style={{
//                   backgroundColor: darkMode
//                     ? index % 2 === 0
//                       ? "#242424"
//                       : "#1a1a1a"
//                     : index % 2 === 0
//                     ? "#f9f9f9"
//                     : "#fff",
//                   transition: "0.3s",
//                   cursor: "pointer",
//                 }}
//               >
//                 <td style={{ padding: "10px" }}>{s.id}</td>
//                 <td style={{ padding: "10px" }}>{s.teamName}</td>
//                 <td style={{ padding: "10px" }}>{s.problem_id || s.problem}</td>
//                 <td style={{ padding: "10px" }}>{s.language_id}</td>
//                 <td style={{ padding: "10px" }}>{formatTimeAgo(s.start_time)}</td>
//                 <td style={{ padding: "10px", color: s.verdictColor, fontWeight: "bold" }}>
//                   {s.verdict}
//                 </td>
//                 <td style={{ padding: "10px" }}>{s.max_run_time}</td>
//                 <td style={{ padding: "10px" }}>{s.start_time}</td>
//                 <td style={{ padding: "10px" }}>{s.end_time}</td>
//                 <td style={{ padding: "10px" }}>
//                   <Link href={`/solutionpage?submissionId=${s.id}`}>
//                     <button
//                       style={{
//                         padding: "5px 10px",
//                         cursor: "pointer",
//                         backgroundColor: "#007bff",
//                         color: "#fff",
//                         border: "none",
//                         borderRadius: "5px"
//                       }}
//                     >
//                       View
//                     </button>
//                   </Link>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


'use client';
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function SubmissionsPage() {
  const searchParams = useSearchParams();
  const problemIdParam = searchParams.get("problemId");
  const filter = searchParams.get("filter") || "all";

  const [submissions, setSubmissions] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const [darkMode, setDarkMode] = useState(false);
  const toggleTheme = () => setDarkMode((prev) => !prev);

  const verdictMap = {
    AC: { label: "Accepted", color: "#28a745" },
    WA: { label: "Wrong Answer", color: "#dc3545" },
    TLE: { label: "Time Limit Exceeded", color: "#ffc107" },
    MLE: { label: "Memory Limit Exceeded", color: "#17a2b8" },
    RE: { label: "Runtime Error", color: "#fd7e14" },
    CE: { label: "Compilation Error", color: "#6c757d" },
    NO: { label: "Pending", color: "#007bff" },
  };

  const myTeamId = 42;

  function formatTimeAgo(dateStr) {
    if (!dateStr) return "-";
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  async function fetchSubmissions() {
    try {
      const subsRes = await fetch("/api/proxy?type=submissions");
      let subsData = await subsRes.json();
      subsData = Array.isArray(subsData)
        ? subsData
        : subsData.submissions || [];

      if (problemIdParam) {
        subsData = subsData.filter(
          (s) => String(s.problem_id || s.problem) === String(problemIdParam)
        );
      }

      const judgeRes = await fetch("/api/proxy?type=judgements");
      let judgeData = await judgeRes.json();
      judgeData = Array.isArray(judgeData)
        ? judgeData
        : judgeData.judgements || [];

      const teamsRes = await fetch("/api/proxy?type=teams");
      const teamsData = await teamsRes.json();
      const teamsMap = {};
      teamsData.forEach((t) => {
        teamsMap[String(t.id)] =
          t.display_name || t.name || t.icpc_id;
      });
      setTeams(teamsMap);

      const merged = subsData.map((s) => {
        const sId = String(s.id);
        const j = judgeData.find((j) => {
          let jid = j.submission_id;
          if (typeof jid === "object" && jid !== null) jid = jid.id;
          return String(jid) === sId;
        });

        return {
          ...s,
          verdict: j
            ? verdictMap[j.judgement_type_id]?.label ||
              j.judgement_type_id
            : "Pending",
          verdictColor: j
            ? verdictMap[j.judgement_type_id]?.color || "#000"
            : "#007bff",
          max_run_time: j?.max_run_time ?? "-",
          start_time: j?.start_time ?? "-",
          end_time: j?.end_time ?? "-",
          teamName:
            teamsMap[String(s.team_id ?? s.team?.id)] || "Unknown",
        };
      });

      merged.sort(
        (a, b) => new Date(b.start_time) - new Date(a.start_time)
      );
      setSubmissions(merged);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(interval);
  }, [problemIdParam]);

  useEffect(() => {
    const interval = setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  const filteredSubmissions =
    filter === "mine"
      ? submissions.filter(
          (s) =>
            String(s.team_id ?? s.team?.id) === String(myTeamId)
        )
      : submissions;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: darkMode ? "#121212" : "#f5f5f5",
        color: darkMode ? "#fff" : "#000",
        minHeight: "100vh",
      }}
    >
      <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />

      <div style={{ padding: "20px" }}>
        <h1 style={{ marginBottom: "20px" }}>
          {filter === "mine" ? "My Submissions" : "All Submissions"}
        </h1>

        <Link href={`/EditorPage?problemId=${problemIdParam}`}>
          <button
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              cursor: "pointer",
              backgroundColor: "green",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
            }}
          >
            🔙 Back to Code Editor
          </button>
        </Link>

        {problemIdParam && (
          <p>
            {filter === "mine" ? "only my submissions" : "all submissions"} for{" "}
            <strong>Problem {problemIdParam}</strong>
          </p>
        )}

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
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
                backgroundColor: darkMode ? "#2a2a2a" : "#f0f0f0",
                color: darkMode ? "#ddd" : "#333",
              }}
            >
              {[
                "Submission ID",
                "Team/User Name",
                "Problem ID",
                "Language",
                "Time",
                "Verdict",
                "Max Run Time",
                "Start Time",
                "End Time",
                "Solution",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    borderBottom: darkMode
                      ? "1px solid #444"
                      : "1px solid #ddd",
                    padding: "12px",
                    textAlign: "left",
                    backgroundColor: darkMode
                      ? "#2a2a2a"
                      : "grey",
                    color: darkMode ? "#ddd" : "#fff",
                    fontWeight: "600",
                    color: "black",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((s, index) => (
              <tr
                key={s.id}
                style={{
                  backgroundColor: darkMode
                    ? index % 2 === 0
                      ? "#242424"
                      : "#1a1a1a"
                    : index % 2 === 0
                    ? "#f9f9f9"
                    : "#fff",
                  transition: "0.3s",
                  cursor: "pointer",
                }}
              >
                <td style={{ padding: "10px" }}>{s.id}</td>
                <td style={{ padding: "10px" }}>{s.teamName}</td>
                <td style={{ padding: "10px" }}>
                  {s.problem_id || s.problem}
                </td>
                <td style={{ padding: "10px" }}>{s.language_id}</td>
                <td style={{ padding: "10px" }}>
                  {formatTimeAgo(s.start_time)}
                </td>
                <td
                  style={{
                    padding: "10px",
                    color: s.verdictColor,
                    fontWeight: "bold",
                  }}
                >
                  {s.verdict}
                </td>
                <td style={{ padding: "10px" }}>{s.max_run_time}</td>
                <td style={{ padding: "10px" }}>{s.start_time}</td>
                <td style={{ padding: "10px" }}>{s.end_time}</td>
                <td style={{ padding: "10px" }}>
                  <Link href={`/solutionpage?submissionId=${s.id}`}>
                    <button
                      style={{
                        padding: "5px 10px",
                        cursor: "pointer",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                      }}
                    >
                      View
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
