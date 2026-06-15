"use client";

import { Editor } from "@monaco-editor/react";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {Select,SelectContent,SelectGroup,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";

type Language = "java" | "javascript" | "python" | "cpp" | "none";
type CodeEditorProps = {
  code: Record<Language, string>;
  onChange: (value: Record<Language, string>) => void;
  setLanguage: (lang: Language) => void;
};

export function CodeEditor({ code, onChange ,setLanguage}: CodeEditorProps) {
  const languages = [
    { value: "java", label: "Java" },
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "cpp", label: "C++" },
    { value: "none", label:"Pseudo Code"}
  ];

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
    none: `// Pseudo Code
`
  };

  const [value, setValue] = useState<Language>("java");
  const handleLanguageChange = (lang: Language) => {
    setValue(lang);
    setLanguage(lang);
  };
  const handleReset = ()=>{
    onChange({
      ...code,
      [value]: defaultCode[value]
    })
  }

  return (
    <div className="relative rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-white">Coding Pad</h3>
        </div>
        <Select value={value} onValueChange={(lang: Language) => handleLanguageChange(lang)}>
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

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
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
            onChange(newValue ? { ...code, [value]: newValue } : code);
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
