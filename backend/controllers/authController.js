const supabase = require('../config/supabase');
const crypto = require('crypto');

/**
 * GadgetFlex Auth Controller
 */

// 1. Signup with Email and Password
exports.signup = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (authError) throw authError;

    // Create profile in public.users
    const { data: user, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          name,
          email,
          role: 'user',
          tier: 'Bronze',
          is_verified: true
        }
      ])
      .select()
      .single();

    if (profileError) throw profileError;

    res.status(201).json({ 
      message: 'Account created successfully! Please log in.',
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Login with Email and Password
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;

    // Fetch profile
    const { data: user, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !user) throw new Error('User profile not found');

    res.json({
      message: 'Login successful',
      token: authData.session.access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier || 'Bronze',
        risk_score: user.risk_score,
        credit_limit: user.credit_limit,
        avatar_url: user.avatar_url || null
      }
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  const { name, card_design, is_card_active, nin, bvn, avatar_url } = req.body;
  try {
    // Build update object, only include defined fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (card_design !== undefined) updateFields.card_design = card_design;
    if (is_card_active !== undefined) updateFields.is_card_active = is_card_active;
    if (nin !== undefined) updateFields.nin = nin;
    if (bvn !== undefined) updateFields.bvn = bvn;
    if (avatar_url !== undefined) updateFields.avatar_url = avatar_url;

    const { data, error } = await supabase
      .from('users')
      .update(updateFields)
      .eq('id', req.user.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.activateCard = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_card_active: true })
      .eq('id', req.user.id)
      .select('id, name, is_card_active')
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'https://gadgetflex.vercel.app';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${frontendUrl}/reset-password`
    });
    if (error) throw error;
    res.json({ message: 'Reset link sent to your email.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Update Password
exports.updatePassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
