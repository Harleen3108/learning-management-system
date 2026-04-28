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
 * Generate a signed URL for secure video streaming
 * @param {String} publicId 
 * @param {String} type - 'upload' or 'authenticated'
 */
exports.getSignedUrl = (publicId, type = 'authenticated') => {
    // Generate a signed URL with 1 hour expiration
    return cloudinary.url(publicId, {
        resource_type: 'video',
        type: type, 
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 3600 // Valid for 1 hour
    });
};
