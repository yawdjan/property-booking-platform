import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory
const uploadsDir = path.join(__dirname, '../../uploads/properties');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    fs.writeFileSync(filepath, req.file.buffer);

    if ( config.nodeEnv === 'development' ) console.log(`✅ Uploaded: ${filename} (${(req.file.size / 10240 / 10240).toFixed(2)}MB)`);

    const imageUrl = `/uploads/properties/${filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;

    // ADD THESE DEBUG LOGS:
    if ( config.nodeEnv === 'development' ) console.log('📸 Image URL:', imageUrl);
    if ( config.nodeEnv === 'development' ) console.log('📸 Full URL:', fullUrl);
    if ( config.nodeEnv === 'development' ) console.log('📸 File exists:', fs.existsSync(filepath));

    res.status(200).json({
      success: true,
      data: {
        url: fullUrl,
        filename: filename,
        size: req.file.size,
        originalName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(uploadsDir, filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      if ( config.nodeEnv === 'development' ) console.log(`🗑️  Deleted: ${filename}`);
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
};