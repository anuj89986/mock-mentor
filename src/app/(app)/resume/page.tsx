"use client";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Trash2,
  Download,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import axios from "axios";
import { toast } from "sonner";

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
      <div className="flex items-center justify-center min-h-screen bg-black flex-col gap-6 px-4">
        <div className="text-white text-center">
          Please sign in to upload a resume.
        </div>
        <Button onClick={() => router.push("/")}>Go to Home</Button>
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
        console.log(res.data.uploadedResume);
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
    window.open(fileUrl, "_blank","noopener,noreferrer");
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden w-screen">
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Resume Management
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Upload and manage your resume for interviews
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
              <span className="font-semibold text-sm sm:text-base">
                {session.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 w-full max-w-5xl mx-auto">
          {/* Hero / Upload */}
          <div className="p-6 sm:p-8 rounded-lg bg-white/5 border border-white/10 border-dashed hover:border-blue-500/30 transition">
            <div className="grid md:grid-cols-[1.2fr_1fr] gap-6 items-center">
              <div>
                <div className="flex items-center gap-2 text-blue-400 mb-3">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-semibold">
                    AI Interview Ready
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                  Upload Your Resume
                </h2>
                <p className="text-gray-400 text-sm sm:text-base">
                  We parse your resume to personalize mock interviews,
                  strengths, and growth areas.
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  Supported formats: PDF, DOC, DOCX (Max 10MB)
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-4">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400" />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start sm:items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-red-400 text-sm sm:text-base">{error}</p>
            </div>
          )}

          {/* File Preview */}
          {uploadedFile && (
            <div className="p-4 sm:p-6 rounded-lg bg-white/5 border border-white/10">
              <h3 className="text-base sm:text-lg font-bold mb-4">
                Selected File
              </h3>
              <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold truncate text-sm sm:text-base">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="p-2 rounded hover:bg-white/10 transition shrink-0"
                >
                  <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-400" />
                </button>
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
              >
                {uploading ? (
                  <div className="flex items-center gap-2 text-white text-sm sm:text-base">
                    {" "}
                    <Spinner className="w-6 h-6 text-white" /> Uploading
                  </div>
                ) : (
                  "Upload Resume"
                )}
              </Button>
            </div>
          )}

          {/* Cards Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-white/5 border border-white/10">
              <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
                Resume Tips
              </h3>
              <ul className="space-y-2 text-gray-300 text-xs sm:text-sm">
                <li>• Keep it to 1-2 pages</li>
                <li>• Use clear formatting and strong section headers</li>
                <li>• Highlight impact with metrics</li>
                <li>• Tailor to each role</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-white/5 border border-white/10">
              <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
                What We Extract
              </h3>
              <ul className="space-y-2 text-gray-300 text-xs sm:text-sm">
                <li>• Skills and tool stack</li>
                <li>• Project impact highlights</li>
                <li>• Leadership and collaboration</li>
                <li>• Technical depth signals</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-white/5 border border-white/10">
              <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                Common Fixes
              </h3>
              <ul className="space-y-2 text-gray-300 text-xs sm:text-sm">
                <li>• Add measurable results</li>
                <li>• Remove weak filler lines</li>
                <li>• Tighten summaries</li>
                <li>• Show recent impact</li>
              </ul>
            </div>
          </div>

          {/* Previous Uploads */}
          <div className="p-4 sm:p-6 rounded-lg bg-white/5 border border-white/10">
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
              Previous Uploads
            </h3>

            {resumeList.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No previous uploads found.
              </p>
            ) : (
              resumeList.map((resume: Resume, index: number) => (
                <div className="space-y-3" key={index}>
                  <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold truncate text-sm sm:text-base">
                          resume_{index + 1}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          {new Date(resume.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs sm:text-sm flex-1 sm:flex-none"
                        onClick={() => handleFileOpen(resume.fileUrl)}
                      >
                        Open
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deleting}
                        className="text-red-400 hover:text-red-300 text-xs sm:text-sm flex-1 sm:flex-none"
                        onClick={() => handleDelete(resume.publicId)}
                      >
                        {deleting && resume.publicId === deletingId ? (
                          <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm">
                            <Spinner className="w-4 h-4 text-red-400" /> Deleting
                          </div>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CTA */}
          <div className="p-6 rounded-lg bg-linear-to-r from-blue-600/10 to-cyan-600/10 border border-white/10">
            <h3 className="text-base sm:text-lg font-bold mb-2">Pro Tip</h3>
            <p className="text-gray-300 text-sm sm:text-base">
              Upload your latest resume and run a quick mock interview to see
              the exact areas to improve.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
