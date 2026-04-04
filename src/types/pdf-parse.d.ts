declare module "pdf-parse/lib/pdf-parse.js" {
  const pdf: (data: Buffer | Uint8Array | ArrayBuffer) => Promise<{
    text: string;
  }>;
  export default pdf;
}