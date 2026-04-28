const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file to Cloudinary
 * @param {String} filePath 
 * @param {String} folder 
 */
exports.uploadFile = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'auto'
        });
        return result;
    } catch (err) {
        throw new Error(err.message);
    }
};

/**
 * Generate a signature for signed uploads
 * @param {Object} paramsToSign 
 */
exports.generateSignature = (paramsToSign) => {
    return cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
};

/**
 * Generate a delivery URL for a video.
 *
 * - For public (`upload`) delivery, no signing is needed — the URL just works.
 * - For `authenticated` delivery, we generate a signed URL with `sign_url: true`.
 *
 * IMPORTANT lessons learned:
 *  • Don't pass `expires_at` — it only works with the auth_token feature; otherwise
 *    it poisons the signature computation and Cloudinary returns 404.
 *  • Don't force `format: 'mp4'` — that triggers on-the-fly transcoding which
 *    authenticated delivery may reject (404). Cloudinary serves the original
 *    extension when no format is specified.
 */
exports.getSignedUrl = (publicId, type = 'upload') => {
    if (type === 'authenticated') {
        return cloudinary.url(publicId, {
            resource_type: 'video',
            type: 'authenticated',
            sign_url: true,
            secure: true
        });
    }
    // Public/upload — no signing required.
    return cloudinary.url(publicId, {
        resource_type: 'video',
        type: 'upload',
        secure: true
    });
};
