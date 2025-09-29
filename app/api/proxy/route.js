import { NextResponse } from "next/server";
import JSZip from "jszip";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const submissionId = searchParams.get("submissionId");

    const authHeader =
      "Basic " + Buffer.from("rani:rani@justuju.in").toString("base64");
    if (type === "problems") {
      const res = await fetch(
        "https://judge.csbasics.in/api/v4/contests/1/problems",
        {
          headers: { Authorization: authHeader, Accept: "application/json" },
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error(`Judge API error: ${res.status}`);
      const data = await res.json();
      return NextResponse.json(data);
    }
    if (type === "solution" && submissionId) {
      const res = await fetch(
        `https://judge.csbasics.in/api/v4/contests/1/submissions/${submissionId}`,
        { headers: { Authorization: authHeader, Accept: "application/json" } }
      );
      const submissionData = await res.json();

      const filesRes = await fetch(
        `https://judge.csbasics.in/api/v4/contests/1/submissions/${submissionId}/files`,
        { headers: { Authorization: authHeader } }
      );
      const buffer = await filesRes.arrayBuffer();
      const zip = await JSZip.loadAsync(Buffer.from(buffer));
      const filesContent = {};

      await Promise.all(
        Object.keys(zip.files).map(async (filename) => {
          const fileData = await zip.files[filename].async("string");
          filesContent[filename] = fileData;
        })
      );

      return NextResponse.json({ ...submissionData, code: filesContent });
    }

    if (type === "judgements") {
      const res = await fetch(
        "https://judge.csbasics.in/api/v4/contests/1/judgements?strict=false",
        { headers: { Authorization: authHeader, Accept: "application/json" } }
      );
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (type === "teams") {
      const res = await fetch(
        "https://judge.csbasics.in/api/v4/contests/1/teams?strict=false",
        { headers: { Authorization: authHeader, Accept: "application/json" } }
      );
      const data = await res.json();
      return NextResponse.json(data);
    }

    const res = await fetch(
      "https://judge.csbasics.in/api/v4/contests/1/submissions?strict=false",
      { headers: { Authorization: authHeader, Accept: "application/json" }, cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json(data);

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}



export async function POST(req) {
  try {
    const formData = await req.formData();
    const problem = formData.get("problem");
    let language = formData.get("language");
    const codeBlob = formData.get("code");
    const codeText = await codeBlob.text();

    if (!["python3", "javascript", "cpp", "c", "java"].includes(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const filename =
      language === "python3" ? "solution.py" :
      language === "cpp" ? "solution.cpp" :
      language === "c" ? "solution.c" :
      language === "java" ? "Main.java" :
      language === "javascript" ? "solution.js" :
      "solution.txt";

    const uploadData = new FormData();
    uploadData.append("problem", problem);
    uploadData.append("language", language);
    uploadData.append(
      "code[]",
      new Blob([codeText], { type: "text/plain" }),
      filename
    );

    console.log("📦 Outgoing submission:", {
      problem,
      language,
      filename,
      keys: [...uploadData.keys()],
    });

    const authHeader =
      "Basic " + Buffer.from("rani:rani@justuju.in").toString("base64");

    const res = await fetch(
      "https://judge.csbasics.in/api/v4/contests/1/submissions",
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
        body: uploadData,
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ DOMjudge submission failed:", res.status, text);
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const result = await res.json();

    return NextResponse.json({
      submissionId: result.id, 
    });

  } catch (err) {
    console.error("❌ Proxy error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
