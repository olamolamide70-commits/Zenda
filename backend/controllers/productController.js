const supabase = require('../config/supabase');

exports.getProducts = async (req, res) => {
  const { category, minPrice, maxPrice, search, vendor_id } = req.query;
  
  try {
    let query = supabase.from('products').select('*');

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    if (minPrice) {
      query = query.gte('price', Number(minPrice));
    }
    if (maxPrice) {
      query = query.lte('price', Number(maxPrice));
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (vendor_id) {
      query = query.eq('vendor_id', vendor_id);
    }

    const { data: products, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    if (req.user && req.user.role === 'vendor') {
      productData.vendor_id = req.user.id;
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let query = supabase.from('products').update(req.body).eq('id', req.params.id);

    if (req.user && req.user.role === 'vendor') {
      query = query.eq('vendor_id', req.user.id);
    }

    const { data: product, error } = await query.select().single();

    if (error || !product) return res.status(404).json({ error: 'Product not found or unauthorized' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    let query = supabase.from('products').delete().eq('id', req.params.id);

    if (req.user && req.user.role === 'vendor') {
      query = query.eq('vendor_id', req.user.id);
    }

    const { error } = await query;

    if (error) throw error;
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
