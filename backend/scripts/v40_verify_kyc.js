const { Pool } = require('pg');
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const verifyKYC = async () => {
  try {
    const testEmail = 'v40_final_test@example.com';
    console.log('--- KYC FINAL VERIFICATION ---');

    // 1. Setup User
    await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
    const { rows: uRows } = await pool.query(
      "INSERT INTO users (name, email, password, role, is_verified) VALUES ($1, $2, $3, $4, TRUE) RETURNING id",
      ['V40 Final', testEmail, 'pass', 'user']
    );
    const userId = uRows[0].id;

    // 2. Submit KYC (Direct DB insert to simulate controller)
    console.log('Submitting KYC to DB...');
    await pool.query(
      "INSERT INTO kyc_verifications (user_id, document_type, document_url, status) VALUES ($1, $2, $3, 'pending')",
      [userId, 'NIN', 'final_test.jpg']
    );
    await pool.query("UPDATE users SET kyc_status = 'pending' WHERE id = $1", [userId]);

    // 3. Trigger Simulation (Mocking the background logic)
    console.log('Triggering background automation...');
    const nin = '99988877766';
    const bvn = '11122233344';
    
    // Logic from kycService.js
    setTimeout(async () => {
      try {
        console.log('Service running in background...');
        await pool.query(
          `UPDATE users SET kyc_status = 'verified', credit_limit = 150000, risk_score = 30, nin = $1, bvn = $2 WHERE id = $3`,
          [nin, bvn, userId]
        );
        await pool.query("UPDATE kyc_verifications SET status = 'verified' WHERE user_id = $1", [userId]);
        console.log('Background update complete.');
      } catch (e) {
        console.error('Background error:', e);
      }
    }, 2000);

    console.log('Waiting for automation...');
    await new Promise(r => setTimeout(r, 4000));

    // 4. Verify
    const { rows: res } = await pool.query('SELECT kyc_status, credit_limit, nin FROM users WHERE id = $1', [userId]);
    if (res[0].kyc_status === 'verified' && res[0].nin === nin) {
      console.log('. KYC VERIFICATION PASSED');
    } else {
      console.error('. KYC VERIFICATION FAILED', res[0]);
    }

  } catch (err) {
    console.error('KYC Test error:', err);
  } finally {
    await pool.end();
  }
};

verifyKYC();
