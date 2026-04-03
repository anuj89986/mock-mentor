import {z} from "zod";

export const uploadResumeSchema = z.object({
  resume: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, "Please upload exactly one file")
    .refine((files) => files[0].size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine((files) => ["application/pdf", "application/msword"].includes(files[0].type), "Only PDF and DOC files are allowed")
});