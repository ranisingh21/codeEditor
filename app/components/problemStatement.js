'use client';
import React, { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';

const ProblemStatementViewer = ({ problemId, darkMode }) => {
  const [pdfText, setPdfText] = useState('Loading...');

  useEffect(() => {
    if (!problemId) return;

    fetch(`https://judge.csbasics.in/api/v4/contests/1/problems/${problemId}/statement?strict=false`)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = async () => {
          const typedArray = new Uint8Array(reader.result);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n\n';
          }
          setPdfText(text);
        };
        reader.readAsArrayBuffer(blob);
      })
      .catch(err => {
        console.error(err);
        setPdfText('Failed to load PDF');
      });
  }, [problemId]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("📋 Copied!");
  };

  const parseSamples = (lines) => {
    const samples = [];
    let currentSample = null;
    let mode = null;

    lines.forEach(line => {
      const trimmed = line.trim();

      if (/^Sample\s*\d+/i.test(trimmed)) {
        if (currentSample) samples.push(currentSample);
        currentSample = { title: trimmed, input: "", output: "" };
        mode = null;
      } else if (/^Input$/i.test(trimmed)) {
        mode = "input";
      } else if (/^Output$/i.test(trimmed)) {
        mode = "output";
      } else if (currentSample && mode) {
        currentSample[mode] += trimmed + "\n";
      }
    });

    if (currentSample) samples.push(currentSample);
    return samples;
  };

  const lines = pdfText.split("\n");
  const samples = parseSamples(lines);

  return (
    <div style={{
      padding: '24px',
      backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
      color: darkMode ? '#e0e0e0' : '#000000',
      borderRadius: '12px',
      height: '94%',
      overflowY: 'auto',
      width: '124%',
      marginLeft: '77px',
      border: darkMode ? '1px solid #333' : '1px solid #ddd',
      boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    }}>
      <h2 style={{ fontSize: '22px', marginBottom: '20px', fontWeight: 'bold', color: darkMode ? '#ffffff' : '#000000' }}>
        Problem Statement
      </h2>

      <div style={{ fontSize: '16px', lineHeight: '1.8', fontFamily: 'Arial, sans-serif' }}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();


          if (/^(Sample\s*\d+|Input|Output)$/i.test(trimmed)) return null;

          if (/^(Input Format|Output Format|Constraints|Explanation)/i.test(trimmed)) {
            return (
              <h3 key={idx} style={{ marginTop: '20px', marginBottom: '10px', fontWeight: 'bold', fontSize: '18px' }}>
                {trimmed}
              </h3>
            );
          }

          if (idx === 0) {
            return (
              <h2 key={idx} style={{ marginTop: '10px', marginBottom: '15px', fontSize: '20px', fontWeight: 'bold' }}>
                {trimmed}
              </h2>
            );
          }

          if (/^\d|\•|\-/.test(trimmed)) {
            return (
              <ul key={idx} style={{ margin: '6px 0 6px 20px', listStyle: 'disc' }}>
                <li>{trimmed.replace(/^[•\-\d\.]+\s*/, '')}</li>
              </ul>
            );
          }

          return <p key={idx} style={{ margin: '5px 0' }}>{trimmed}</p>;
        })}

        {samples.map((s, i) => (
          <div key={i} style={{ marginTop: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '10px' }}>{s.title}</h3>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '10px'
            }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #aaa', padding: '8px', width: '50%' }}>Input</th>
                  <th style={{ border: '1px solid #aaa', padding: '8px', width: '50%' }}>Output</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #aaa', padding: '8px', verticalAlign: 'top' }}>
                    <pre style={{ margin: 0 }}>{s.input.trim()}</pre>
                    <button 
                      onClick={() => copyToClipboard(s.input.trim())}
                      style={{ marginTop: '5px', cursor: 'pointer' }}
                    >📋 Copy</button>
                  </td>
                  <td style={{ border: '1px solid #aaa', padding: '8px', verticalAlign: 'top' }}>
                    <pre style={{ margin: 0 }}>{s.output.trim()}</pre>
                    <button 
                      onClick={() => copyToClipboard(s.output.trim())}
                      style={{ marginTop: '5px', cursor: 'pointer' }}
                    >📋 Copy</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProblemStatementViewer;
