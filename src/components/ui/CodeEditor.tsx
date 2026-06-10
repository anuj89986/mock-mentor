'use client';

import { Editor } from '@monaco-editor/react';
import { Play, RotateCcw, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function CodeEditor() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-white">
            Coding Pad
          </h3>

          <select className="rounded-md border border-white/10 bg-slate-800 px-3 py-1 text-sm text-gray-200 outline-none">
            <option>Java</option>
            <option>JavaScript</option>
            <option>Python</option>
            <option>C++</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>

          <Button size="sm">
            <Play className="mr-2 h-4 w-4" />
            Run
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="h-125">
        <Editor
          height="100%"
          language="java"
          theme="vs-dark"
          defaultValue={`public class Solution {
    public static void main(String[] args) {
        
    }
}`}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: {
              top: 16,
              bottom: 16,
            },
          }}
        />
      </div>
    </div>
  );
}