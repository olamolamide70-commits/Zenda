const supabase = require('../config/supabase');

exports.submitKYC = async (req, res) => {
  try {
    const { documentType, documentUrl, nin, bvn, cacNumber, cacUrl } = req.body;
    
    // 1. Update user record with core KYC fields
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({
        kyc_status: 'pending',
        nin,
        bvn,
        cac_number: cacNumber,
        cac_url: cacUrl
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 2. Log the submission in kyc_verifications for audit trail
    await supabase
      .from('kyc_verifications')
      .insert([{
        user_id: req.user.id,
        document_type: documentType,
        document_url: documentUrl,
        status: 'pending'
      }]);
    
    res.status(201).json({ 
      message: 'KYC submitted successfully and is pending review', 
      user 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getKYCStatus = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('kyc_status, nin, bvn')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json({ status: user.kyc_status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.adminReviewKYC = async (req, res) => {
  const { userId, status, creditLimit, adminNotes } = req.body;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        kyc_status: status,
        credit_limit: status === 'verified' ? (creditLimit || 500000) : 0,
        risk_score: status === 'verified' ? 20 : 0
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Update the latest kyc_verifications record
    // First fetch the latest record ID (cannot use .order() with .update() in Supabase)
    const { data: latestKyc } = await supabase
      .from('kyc_verifications')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latestKyc) {
      await supabase
        .from('kyc_verifications')
        .update({ status, admin_notes: adminNotes })
        .eq('id', latestKyc.id);
    }

    res.json({ message: `KYC ${status}`, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
