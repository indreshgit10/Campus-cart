import cloudinary from '../config/cloudinary.js';

/**
 * @desc    Generate Cloudinary signature for signed uploads
 * @route   GET /api/upload/signature
 * @access  Private
 */
export const getCloudinarySignature = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
        folder: 'campuscart/products'
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      folder: 'campuscart/products'
    });
  } catch (error) {
    console.error('Cloudinary Signature Error:', error);
    res.status(500).json({ message: 'Internal Server Error while generating signature' });
  }
};
