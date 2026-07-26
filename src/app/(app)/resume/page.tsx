"use client";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Download,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link"; // Added Link import for the back button

interface Resume {
  _id: string;
  userId: string;
  fileUrl: string;
  publicId: string;
  extractedText: string;
  createdAt: Date;
}

export default function ResumePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [resumeList, setResumeList] = useState<Resume[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await axios.get("/api/resume/all-resume");
        if (res.status === 200) {
          setResumeList(res.data.resume);
        } else {
          setError("Failed to fetch resumes. Please refresh the page.");
        }
      } catch (error) {
        setError("Failed to fetch resumes. Please refresh the page.");
      }
    };
    fetchResumes();
  }, []);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-[#F3EBDD] p-6 gap-6 text-[#5C5147] selection:bg-[#8C5A3C] selection:text-[#FFFDF8]">
        <div className="text-base md:text-lg font-medium tracking-wide text-center text-[#2B2118]">
          Please sign in to upload a resume.
        </div>
        <Button
          onClick={() => router.push("/")}
          className="bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] font-medium rounded-2xl px-8 py-6 transition-all duration-200 ease-out w-full sm:w-auto shadow-sm"
        >
          Go to Home
        </Button>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      file.type === "application/pdf" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      setUploadedFile(file);
      setError("");
    } else {
      setError("Please upload a PDF or Word document");
      setUploadedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("resume", uploadedFile);
      const res = await axios.post("/api/resume/upload", formData);
      if (res.status === 200) {
        setUploadedFile(null);
        setResumeList((prev) => [...prev, res.data.uploadedResume]);
        setError("");
        toast.success("Resume uploaded successfully.");
      } else {
        setError("Failed to upload resume. Please try again.");
        toast.error("Failed to upload resume. Please try again.");
      }
    } catch {
      setError("Failed to upload resume. Please try again.");
      toast.error("Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (publicId: string) => {
    setDeletingId(publicId);
    setDeleting(true);
    try {
      await axios.delete("/api/resume/delete-resume", { data: { publicId } });
      setResumeList((prev) =>
        prev.filter((resume) => resume.publicId !== publicId),
      );
      toast.success("Resume deleted successfully.");
    } catch (error) {
      setError("Failed to delete resume. Please try again.");
      toast.error("Failed to delete resume. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleFileOpen = (fileUrl: string) => {
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    // Changed: min-h-[100dvh] for native body scrolling, removed overflow-hidden
    <div className="min-h-dvh flex flex-col w-full bg-[#F3EBDD] text-[#5C5147] font-sans selection:bg-[#8C5A3C] selection:text-[#FFFDF8]">
      
      {/* Sticky Header - Made slim, added back button and centered title */}
      <header className="sticky top-0 z-20 w-full bg-[#FBF7EF]/95 backdrop-blur-xl border-b border-[#D8CDBD] py-3 md:py-4 transition-all duration-200 shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-12 max-w-6xl mx-auto gap-4 relative">
          
          <Button
            asChild
            variant="outline"
            className="border-[#D8CDBD] bg-[#FFFDF8] text-[#5C5147] hover:bg-[#FBF7EF] hover:text-[#2B2118] rounded-full sm:rounded-2xl shadow-sm transition-all h-9 px-3 sm:px-4 shrink-0 relative z-10"
          >
            <Link href="/dashboard" className="flex items-center">
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Button>

          {/* Absolute centered mobile title */}
          <span className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-[#2B2118] sm:hidden truncate">
            Resumes
          </span>

          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-[#FFFDF8] border border-[#D8CDBD] flex items-center justify-center text-[#8C5A3C] shrink-0 shadow-sm relative z-10">
            <span className="font-medium text-sm md:text-base">
              {session.user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-10 pb-12">
        
        {/* Page Titles - Moved out of the sticky header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-medium tracking-tight text-[#2B2118] mb-1 md:mb-2">
            Resume Management
          </h1>
          <p className="text-[#8D8175] text-sm md:text-base font-normal max-w-2xl">
            Upload and manage your resumes for personalized interviews.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8 w-full">
          
          {/* Alerts */}
          {error && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF8] border border-[#8C5A3C]/30 flex items-start sm:items-center gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-[#8C5A3C] shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-[#8C5A3C] text-sm sm:text-base font-medium">{error}</p>
            </div>
          )}

          {/* Hero / Upload - Card Layer */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#FFFDF8] border border-[#D8CDBD] border-dashed hover:border-[#8C5A3C]/50 transition-all duration-300 ease-out shadow-sm group">
            <div className="grid md:grid-cols-[1.5fr_1fr] gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-[#D8CDBD] bg-[#FBF7EF] text-[10px] md:text-xs font-medium uppercase tracking-widest text-[#8C5A3C] shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Interview Ready
                </div>
                <h2 className="text-xl md:text-2xl font-medium text-[#2B2118] mb-2 tracking-wide">
                  Upload Your Resume
                </h2>
                <p className="text-[#8D8175] text-sm sm:text-base leading-relaxed mb-4">
                  We analyze your resume to generate personalized mock interviews, highlighting your specific strengths and tailoring questions to your experience level.
                </p>
                <p className="text-xs font-medium uppercase tracking-widest text-[#8D8175]">
                  Supported formats: PDF, DOC, DOCX (Max 10MB)
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-5 p-6 rounded-xl bg-[#FBF7EF] border border-[#D8CDBD] group-hover:border-[#8C5A3C]/30 transition-colors">
                <div className="w-16 h-16 rounded-full bg-[#FFFDF8] border border-[#D8CDBD] flex items-center justify-center shadow-sm">
                  <Upload className="w-7 h-7 text-[#8C5A3C]" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] rounded-2xl px-6 shadow-md transition-all duration-200 ease-out font-medium w-full sm:w-auto"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
          </div>

          {/* Selected File Preview */}
          {uploadedFile && (
            <div className="p-6 md:p-8 rounded-2xl bg-[#FFFDF8] border border-[#D8CDBD] shadow-sm">
              <h3 className="text-base sm:text-lg font-medium text-[#2B2118] mb-4">
                Selected File
              </h3>
              <div className="p-4 sm:p-5 rounded-xl bg-[#FBF7EF] border border-[#D8CDBD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#FFFDF8] border border-[#D8CDBD] flex items-center justify-center shrink-0 shadow-sm">
                    <FileText className="w-6 h-6 text-[#8C5A3C]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#2B2118] truncate text-sm sm:text-base">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs sm:text-sm text-[#8D8175] mt-0.5">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="p-2.5 rounded-xl hover:bg-[#FFFDF8] hover:shadow-sm border border-transparent hover:border-[#D8CDBD] transition-all shrink-0 group"
                  title="Remove file"
                >
                  <Trash2 className="w-5 h-5 text-[#8D8175] group-hover:text-[#8C5A3C]" />
                </button>
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-[#8C5A3C] hover:bg-[#A06A47] text-[#FFFDF8] rounded-2xl py-6 shadow-md transition-all duration-200 ease-out font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="w-5 h-5 text-[#FFFDF8]" /> 
                    <span>Uploading...</span>
                  </div>
                ) : (
                  "Confirm & Upload Resume"
                )}
              </Button>
            </div>
          )}

          {/* Info Cards Row - Paper Layer */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="p-6 md:p-8 rounded-2xl bg-[#FBF7EF] border border-[#D8CDBD] shadow-sm">
              <h3 className="text-base font-medium text-[#2B2118] mb-4 flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#8C5A3C]" />
                Resume Tips
              </h3>
              <ul className="space-y-3 text-[#5C5147] text-sm">
                <li className="flex items-start gap-2"><span className="text-[#8D8175] mt-0.5">•</span> Keep it to 1-2 pages</li>
                <li className="flex items-start gap-2"><span className="text-[#8D8175] mt-0.5">•</span> Use clear formatting and sections</li>
                <li className="flex items-start gap-2"><span className="text-[#8D8175] mt-0.5">•</span> Highlight impact with metrics</li>
                <li className="flex items-start gap-2"><span className="text-[#8D8175] mt-0.5">•</span> Tailor to your desired role</li>
              </ul>
            </div>

            <div className="p-6 md:p-8 rounded-2xl bg-[#FBF7EF] border border-[#D8CDBD] shadow-sm">
              <h3 className="text-base font-medium text-[#2B2118] mb-4 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#8C5A3C]" />
                What We Extract
              </h3>
              <ul className="space-y-3 text-[#5C5147] text-sm">
                <li className="flex items-start gap-2"><span className="text-[#8D8175] mt-0.5">•</span> Core skills and tool stack</li>
                <li className="flex items-start gap-2"><span className="text-[#8D8175] mt-0.5">•</span> Project impact highlights</li>
                <li className="flex items-start gap-2"><span className="text-[#8D8175] mt-0.5">•</span> Leadership capabilities</li>
                <li className="flex items-start gap-2"><span className="text-[#8D8175] mt-0.5">•</span> Technical depth signals</li>
              </ul>
            </div>

            <div className="p-6 md:p-8 rounded-2xl bg-[#FBF7EF] border border-[#D8CDBD] shadow-sm sm:col-span-2 lg:col-span-1">
              <h3 className="text-base font-medium text-[#2B2118] mb-4 flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-[#8C5A3C]" />
                Common Fixes
              </h3>
              <ul className="space-y-3 text-[#5C5147] text-sm">
                <li className="flex items-start gap-2"><span className="text-[#8D8175] mt-0.5">•</span> Add measurable results</li>
                <li className="flex items-start gap-2"><span className="text-[#8D8175] mt-0.5">•</span> Remove weak filler lines</li>
                <li className="flex items-start gap-2"><span className="text-[#8D8175] mt-0.5">•</span> Tighten your summary</li>
                <li className="flex items-start gap-2"><span className="text-[#8D8175] mt-0.5">•</span> Emphasize recent impact</li>
              </ul>
            </div>
          </div>

          {/* Previous Uploads - Card Layer */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#FFFDF8] border border-[#D8CDBD] shadow-sm">
            <h3 className="text-lg font-medium text-[#2B2118] mb-5 sm:mb-6 flex items-center gap-2">
              <Download className="w-5 h-5 text-[#8C5A3C]" />
              Previous Uploads
            </h3>

            {resumeList.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-[#D8CDBD] border-dashed bg-[#FBF7EF]">
                <p className="text-[#8D8175] text-sm">
                  No previous uploads found. Upload your first resume above.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {resumeList.map((resume: Resume, index: number) => (
                  <div 
                    key={index} 
                    className="p-4 sm:p-5 rounded-xl bg-[#FBF7EF] border border-[#D8CDBD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 hover:bg-[#FFFDF8] hover:border-[#8C5A3C]/30 hover:shadow-sm group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#FFFDF8] border border-[#D8CDBD] flex items-center justify-center shrink-0 shadow-sm transition-colors group-hover:border-[#8C5A3C]/20">
                        <FileText className="w-5 h-5 text-[#8C5A3C]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[#2B2118] truncate text-sm sm:text-base transition-colors group-hover:text-[#8C5A3C]">
                          Resume_{index + 1}
                        </p>
                        <p className="text-[10px] md:text-xs text-[#8D8175] mt-0.5 uppercase tracking-widest font-medium">
                          Uploaded on {new Date(resume.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs sm:text-sm flex-1 sm:flex-none border-[#D8CDBD] bg-[#FFFDF8] text-[#5C5147] hover:bg-[#FBF7EF] hover:text-[#2B2118] rounded-xl shadow-sm"
                        onClick={() => handleFileOpen(resume.fileUrl)}
                      >
                        Open
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deleting}
                        className="text-xs sm:text-sm flex-1 sm:flex-none border-[#D8CDBD] bg-[#FFFDF8] text-[#8C5A3C] hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl shadow-sm transition-colors"
                        onClick={() => handleDelete(resume.publicId)}
                      >
                        {deleting && resume.publicId === deletingId ? (
                          <div className="flex items-center justify-center gap-2">
                            <Spinner className="w-3.5 h-3.5" /> Deleting...
                          </div>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA Hint */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#FBF7EF] border border-[#D8CDBD] relative overflow-hidden shadow-sm">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8C5A3C] rounded-l-2xl"></div>
            <h3 className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-[#8C5A3C] mb-2 pl-2 md:pl-0">
              Pro Tip
            </h3>
            <p className="text-sm md:text-base text-[#5C5147] font-normal leading-relaxed pl-2 md:pl-0">
              Upload your latest resume and run a quick mock interview to see the exact areas you can improve before the real thing.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}