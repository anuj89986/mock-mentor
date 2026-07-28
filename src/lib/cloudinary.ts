import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream';


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET
});

interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
}

const uploadFileToCloudinary = async (
  file: Buffer,
  format: "pdf" | "docx"
): Promise<CloudinaryUploadResult> => {
  try {
    const result = new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", folder: "resumes", format },
        (error, result) => {
          if (error) return reject(error);
          if (!result?.secure_url || !result?.public_id) {
            return reject(new Error("Cloudinary did not return required fields"));
          }
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        }
      );

      Readable.from(file).pipe(uploadStream);
    });

    return await result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

const deleteFromCloudinary = async(publicId : string) : Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};

export { uploadFileToCloudinary, deleteFromCloudinary };
export default cloudinary;