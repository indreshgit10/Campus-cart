import axios from 'axios';

/**
 * Uploads a file to Cloudinary using a signed request.
 * 
 * @param {File} file - The file to upload.
 * @param {string} resourceType - The type of resource ('image' or 'raw').
 * @returns {Promise<string>} - The secure URL of the uploaded resource.
 */
export const uploadToCloudinary = async (file, resourceType = 'image') => {
  try {
    // 1. Get signature from backend
    const token = localStorage.getItem('token');
    const { data: config } = await axios.get(`${import.meta.env.VITE_API_URL}/upload/signature`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 2. Prepare FormData for Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', config.api_key);
    formData.append('timestamp', config.timestamp);
    formData.append('signature', config.signature);
    formData.append('upload_preset', config.upload_preset);
    formData.append('folder', config.folder);

    // 3. Upload to Cloudinary
    console.log(`📤 [CLOUDINARY] Uploading ${file.name} as ${resourceType}...`);
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${config.cloud_name}/${resourceType}/upload`,
      formData
    );

    console.log(`✅ [CLOUDINARY] Success! URL:`, response.data.secure_url);
    return response.data.secure_url;
  } catch (error) {
    console.error('❌ [CLOUDINARY] Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to upload to Cloudinary');
  }
};
