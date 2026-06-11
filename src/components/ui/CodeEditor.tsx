"use client";

import { Editor } from "@monaco-editor/react";
import { Play, RotateCcw, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Language = "java" | "javascript" | "python" | "cpp";

export function CodeEditor() {
  const languages = [
    { value: "java", label: "Java" },
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "cpp", label: "C++" },
  ];
  const [value, setValue] = useState<Language>("java");
  const defaultCode = {
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,

    javascript: `function main() {
    console.log("Hello, World!");
}

main();`,

    python: `def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()`,

    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  };
  const [code, setCode] = useState(defaultCode);
  const handleLanguageChange = (lang: string) => {
    setValue(lang as Language);
  };

  return (
    <div className="relative rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-white">Coding Pad</h3>

          <Select value={value} onValueChange={(value) => handleLanguageChange(value)}>
            <SelectTrigger className="w-full max-w-48" >
              <SelectValue/>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
          language={value}
          theme="vs-dark"
          value={code[value]}
          onChange={(newValue) => {
            setCode((prev) => ({ ...prev, [value]: newValue }));
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            lineNumbers: "on",
            wordWrap: "on",
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
