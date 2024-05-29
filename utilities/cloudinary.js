import dotenv from 'dotenv';
import fs from "fs"
dotenv.config();
import  cloudinary from "cloudinary"
cloudinary.config({
    cloud_name  :  process.env.CLOUD_NAME,
    api_key : process.env.API_KEY,
    api_secret : process.env.API_SECRET
})

const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new Error("Local file path is missing.");
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        
        // If upload is successful, unlink the local file
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        // If an error occurs, log it and return null
        console.error("Error uploading file to Cloudinary:", error);
        return null;
    }
};
export default uploadCloudinary;