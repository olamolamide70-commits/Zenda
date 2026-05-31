const supabase = require('../config/supabase');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

      if (error || !authUser) {
        return res.status(401).json({ error: 'Not authorized, token failed or expired' });
      }

      // Fetch additional profile data from our public.users table
      const { data: user, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError || !user) {
        return res.status(401).json({ error: 'User profile not found' });
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        kyc_status: user.kyc_status,
        risk_score: user.risk_score,
        credit_limit: user.credit_limit,
        tier: user.tier || 'Bronze',
        interest_discount: user.interest_discount || 0,
        nin: user.nin,
        bvn: user.bvn
      };
      
      next();
    } catch (error) {
      console.error('Auth Error:', error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

exports.optional = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
      if (!error && authUser) {
        const { data: user } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        if (user) {
          req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tier: user.tier || 'Bronze'
          };
        }
      }
    } catch (error) {
      console.warn('Optional Auth failed:', error.message);
    }
  }
  next();
};

exports.admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as an admin' });
  }
};

exports.superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as a super admin' });
  }
};

exports.vendor = (req, res, next) => {
  if (req.user && (req.user.role === 'vendor' || req.user.role === 'super_admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as a merchant' });
  }
};

exports.customerCare = (req, res, next) => {
  if (req.user && (req.user.role === 'customer_care' || req.user.role === 'admin' || req.user.role === 'super_admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as a customer care agent' });
  }
};

exports.merchantApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API Key missing' });
  }

  try {
    const { data: keyData, error } = await supabase
      .from('merchant_api_keys')
      .select('*, users:merchant_id(*)')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single();

    if (error || !keyData) {
      return res.status(401).json({ error: 'Invalid or inactive API Key' });
    }

    // Attach merchant to request
    req.merchant = keyData.users;

    // Update last used at
    await supabase
      .from('merchant_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id);

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
