import dotenv from "dotenv";
dotenv.config({path: './.env'});
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

//Config all env filess
cloudinary.config({
    cloud_name:process.env.CLOUDNAME,
    api_key:process.env.APIKEY,
    api_secret:process.env.APISECRET,
});

//uploading files from localFilePath
const uploadonCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Replace Windows backslashes
    const cloudPath = localFilePath.replace(/\\/g, '/');

    const response = await cloudinary.uploader.upload(cloudPath, {
      resource_type: 'auto',
    });

    //unlinkg after file uploaded
    console.log('✅ File uploaded to Cloudinary:', response.url);
    fs.unlinkSync(localFilePath); // remove from temp folder
    return response;

  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadonCloudinary };
