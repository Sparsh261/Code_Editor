import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { dracula } from '@uiw/codemirror-theme-dracula';

import { EditorView } from '@codemirror/view';
import { autocompletion } from '@codemirror/autocomplete';
import { syntaxHighlighting } from '@codemirror/language';
import { defaultHighlightStyle } from '@codemirror/highlight';

import FadeLoader from 'react-spinners/FadeLoader';


import axios from 'axios';

const baseExtensions = [
  autocompletion(),
  EditorView.lineWrapping,
  syntaxHighlighting(defaultHighlightStyle)
];

const languages = [
  {
    name: 'JavaScript',
    value: 'javascript',
    version: '18.15.0',
    filename: 'index.js',
    extension: () => javascript(),
    boilerplate: `console.log('Hello, JavaScript!');`,
  },
  {
    name: 'Python',
    value: 'python',
    version: '3.10.0',
    filename: 'main.py',
    extension: () => python(),
    boilerplate: `print("Hello, Python!")`,
  },
  {
    name: 'C',
    value: 'c',
    version: '10.2.0',
    filename: 'main.c',
    extension: () => cpp(), // Reuse C++ mode
    boilerplate: `#include <stdio.h>

int main() {
    printf("Hello, C!\\n");
    return 0;
}`,
  },
  {
    name: 'C++',
    value: 'cpp',
    version: '10.2.0',
    filename: 'main.cpp',
    extension: () => cpp(),
    boilerplate: `#include <iostream>

int main() {
    std::cout << "Hello, C++!" << std::endl;
    return 0;
}`,
  },
  {
    name: 'Java',
    value: 'java',
    version: '15.0.2',
    filename: 'Main.java',
    extension: () => java(), // Just for highlighting
    boilerplate: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`,
  },
];

const CodeEditor = () => {
  const [language, setLanguage] = useState(languages[0]);
  const [code, setCode] = useState(languages[0].boilerplate);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
        language: language.value,
        version: language.version,
        files: [
          {
            name: language.filename,
            content: code,
          },
        ],
      });
      const result = response.data.run.output;
      setOutput(result);
    } catch (err) {
      setOutput(`Error: ${err.response?.data?.message || err.message}`);
    }
    setLoading(false);
  };

  return (
  <div style={{ display: 'flex', height: '95vh', padding: '20px', boxSizing: 'border-box' }}>
    {/* Left: Code Editor */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginRight: '20px', position: 'relative', background: '#282a36', borderRadius: '6px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#1e1f29', borderTopLeftRadius: '6px', borderTopRightRadius: '6px' }}>
        <label style={{ color: '#f8f8f2' }}>
          Select Language:{' '}
          <select
            value={language.value}
            onChange={(e) => {
              const selected = languages.find((lang) => lang.value === e.target.value);
              setLanguage(selected);
              setCode(selected.boilerplate);
              setOutput('');
            }}
            style={{ background: '#44475a', color: '#f8f8f2', border: 'none', padding: '4px 8px', borderRadius: '4px' }}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.name}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={runCode}
          style={{
            background: '#50fa7b',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#282a36'
          }}
        >
          Run Code
        </button>
      </div>

      {/* CodeMirror */}
      <div style={{ flex: 1 }}>
        <CodeMirror
          value={code}
          height="100%"
          theme={dracula}
          extensions={[language.extension(), ...baseExtensions]}
          onChange={(value) => setCode(value)}
        />
      </div>
    </div>

    {/* Right: Output */}
    <div style={{
      width: '40%',
      background: '#282a36',
      color: '#f8f8f2',
      padding: '20px',
      borderRadius: '6px',
      overflow: 'auto',
      whiteSpace: 'pre-wrap'
    }}>
      <h2 style={{ color: '#bd93f9', marginTop: 0 }}>Output</h2>
      {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
            <FadeLoader
            color={"#fefefe"}
  height={30}
  margin={10}
  radius={30}
  width={6}
/>
          </div>
        ) : (
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{output}</pre>
        )}
    </div>
  </div>
);

};

export default CodeEditor;
