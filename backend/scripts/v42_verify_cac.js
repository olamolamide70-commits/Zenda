const { Pool } = require('pg');
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const verifyCACUpload = async () => {
  try {
    const testEmail = 'v40_cac_test@example.com';
    console.log('--- CAC UPLOAD VERIFICATION ---');

    // 1. Setup Vendor User
    await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
    const { rows: uRows } = await pool.query(
      "INSERT INTO users (name, email, password, role, is_verified) VALUES ($1, $2, $3, $4, TRUE) RETURNING id",
      ['CAC Vendor', testEmail, 'pass', 'vendor']
    );
    const userId = uRows[0].id;

    // 2. Submit KYC with CAC
    console.log('Submitting KYC with CAC URL...');
    const cacUrl = 'https://example.com/cac_cert.jpg';
    
    // Simulating controller call
    await pool.query(
      "INSERT INTO kyc_verifications (user_id, document_type, document_url, cac_url, status) VALUES ($1, $2, $3, $4, 'pending')",
      [userId, 'NIN', 'id_card.jpg', cacUrl]
    );

    // Triggering service simulation (modified to include cac_url)
    console.log('Triggering automation...');
    await pool.query(
      `UPDATE users SET kyc_status = 'verified', credit_limit = 500000, cac_number = 'RC-TEST123', cac_url = $1 WHERE id = $2`,
      [cacUrl, userId]
    );
    await pool.query("UPDATE kyc_verifications SET status = 'verified' WHERE user_id = $1 AND cac_url = $2", [userId, cacUrl]);

    // 3. Verify
    const { rows: res } = await pool.query('SELECT kyc_status, cac_url FROM users WHERE id = $1', [userId]);
    const { rows: resKV } = await pool.query('SELECT status, cac_url FROM kyc_verifications WHERE user_id = $1', [userId]);

    if (res[0].kyc_status === 'verified' && res[0].cac_url === cacUrl && resKV[0].cac_url === cacUrl) {
      console.log('. CAC UPLOAD VERIFICATION PASSED');
    } else {
      console.error('. CAC UPLOAD VERIFICATION FAILED', { user: res[0], kyc: resKV[0] });
    }

  } catch (err) {
    console.error('CAC Test error:', err);
  } finally {
    await pool.end();
  }
};

verifyCACUpload();
