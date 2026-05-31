const sharp = require('sharp');
const supabase = require('../config/supabase');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const file = req.files.image;
    
    // Compress with Sharp
    const compressedBuffer = await sharp(file.data)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Insert into Supabase (Pre-formatting binary buffer as hex for Postgres BYTEA)
    const { data, error } = await supabase
      .from('product_images')
      .insert([{ data: '\\x' + compressedBuffer.toString('hex'), mime_type: 'image/jpeg' }])
      .select('id')
      .single();

    if (error) throw error;

    const backendUrl = process.env.BACKEND_URL || 'https://zenda-4ggq.onrender.com';
    const publicUrl = `${backendUrl}/api/upload/image/${data.id}`;
    res.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('product_images')
      .select('data, mime_type')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Hex format returned by Supabase has \x prefix, parse it to binary buffer
    const hexData = data.data.startsWith('\\x') ? data.data.slice(2) : data.data;
    const imageBuffer = Buffer.from(hexData, 'hex');
    res.set('Content-Type', data.mime_type);
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
