import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';

/**
 * @desc    Fetch a PDF from a URL and stream it to the client
 * @route   GET /api/pdf-proxy?url=...
 * @access  Public
 */
export const proxyPDF = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ message: 'URL parameter is required' });
  }

  try {
    let targetUrl = url;

    // 🚀 NEW: Auto-sign Cloudinary URLs if API Secret is configured
    if (targetUrl.includes('cloudinary.com') && process.env.CLOUDINARY_API_SECRET) {
      try {
        const parts = targetUrl.split('/upload/');
        if (parts.length === 2) {
          let pathAfterUpload = parts[1];
          // Strip the version prefix e.g 'v1234456/' if present 
          const versionMatch = pathAfterUpload.match(/^v\d+\/(.+)$/);
          if (versionMatch) {
            pathAfterUpload = versionMatch[1];
          }

          const resourceType = targetUrl.includes('/raw/') ? 'raw' : (targetUrl.includes('/video/') ? 'video' : 'image');
          
          targetUrl = cloudinary.url(pathAfterUpload, {
              resource_type: resourceType,
              secure: true,
              sign_url: true
          });
          console.log(`[PDF Proxy] Auth configured. Upgraded to Signed URL: ${targetUrl}`);
        }
      } catch (err) {
        console.error(`[PDF Proxy] Error signing URL:`, err);
        // keep targetUrl as is if signing fails
      }
    }

    console.log(`[PDF Proxy] Fetching: ${targetUrl}`);
    
    let response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    // 🔄 FALLBACK 1: If Cloudinary returns 404 for an /image/ URL, try forcing it to use /fl_attachment/
    if (!response.ok && response.status === 404 && targetUrl.includes('/image/upload/')) {
      const fallbackUrlAttachment = targetUrl.replace('/image/upload/', '/image/upload/fl_attachment/');
      console.log(`[PDF Proxy] 404 Detected. Retrying with fl_attachment: ${fallbackUrlAttachment}`);
      response = await fetch(fallbackUrlAttachment, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
    }

    // 🔄 FALLBACK 2: If Cloudinary returns 401 for an /image/ URL, try forcing it to /raw/
    if (!response.ok && response.status === 401 && targetUrl.includes('/image/upload/')) {
      const fallbackUrlRaw = targetUrl.replace('/image/upload/', '/raw/upload/');
      console.log(`[PDF Proxy] 401 Detected. Retrying with Raw Tunnel: ${fallbackUrlRaw}`);
      response = await fetch(fallbackUrlRaw, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
    }

    if (!response.ok) {
      console.error(`[PDF Proxy] Source returned: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ 
        message: 'Failed to fetch PDF from source', 
        status: response.status,
        statusText: response.statusText,
        sourceUrl: targetUrl 
      });
    }

    const contentType = response.headers.get('content-type');
    console.log(`[PDF Proxy] Success. Content-Type: ${contentType}`);
    res.setHeader('Content-Type', contentType || 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Access-Control-Allow-Origin', '*'); 

    // Stream the native fetch ReadableStream to Node.js response
    const nodeStream = Readable.fromWeb(response.body);
    nodeStream.pipe(res);
  } catch (error) {
    console.error('PDF Proxy Error:', error);
    res.status(500).json({ message: 'Internal Server Error while proxying PDF' });
  }
};

/**
 * @desc    Generate Cloudinary signature for signed uploads
 * @route   GET /api/cloudinary/sign
 * @access  Private
 */
export const getCloudinarySignature = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
        folder: 'campuscart/documents'
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      folder: 'campuscart/documents'
    });
  } catch (error) {
    console.error('Cloudinary Signature Error:', error);
    res.status(500).json({ message: 'Internal Server Error while generating signature' });
  }
};
