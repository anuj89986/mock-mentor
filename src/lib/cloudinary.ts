import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream';


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET
});

const uploadToCloudinary = async (file: Buffer): Promise<string> => {
    try {
        const result = new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'raw', folder: 'resumes' },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result?.secure_url) return reject(new Error('Cloudinary did not return secure_url'));
                    resolve(result.secure_url);
                }
            );
            Readable.from(file).pipe(uploadStream);
        });
        return await result;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

export { uploadToCloudinary };
export default cloudinary;