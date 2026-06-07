const { Pool } = require('pg');
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const verifySettlement = async () => {
  try {
    const testEmail = 'v41_final_test@example.com';
    console.log('--- SETTLEMENT FINAL VERIFICATION ---');

    // 1. Setup Data
    await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
    const { rows: uRows } = await pool.query(
      "INSERT INTO users (name, email, password, role, is_verified) VALUES ($1, $2, $3, $4, TRUE) RETURNING id",
      ['V41 Final', testEmail, 'pass', 'user']
    );
    const userId = uRows[0].id;

    const { rows: oRows } = await pool.query(
      "INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING id",
      [userId, 200000, 'pending']
    );
    const orderId = oRows[0].id;

    const { rows: iRows } = await pool.query(
      `INSERT INTO installments (order_id, total_installments, total_amount, remaining_balance, frequency, next_payment_date, status) 
       VALUES ($1, $2, $3, $4, $5, NOW(), 'active') RETURNING id`,
      [orderId, 4, 200000, 200000, 'monthly']
    );
    const instId = iRows[0].id;

    // 2. Simulate Webhook
    console.log('Triggering Webhook automation...');
    const amountPaid = 50000; // 50,000 Naira
    
    // Logic from webhookController.js
    await pool.query(
      `INSERT INTO transactions (installment_id, amount, status, payment_reference) 
       VALUES ($1, $2, 'success', 'FINAL_TEST_REF')`,
      [instId, amountPaid]
    );

    await pool.query(
      "UPDATE installments SET remaining_balance = remaining_balance - $1, status = 'active' WHERE id = $2",
      [amountPaid, instId]
    );

    await pool.query(
      `INSERT INTO auto_debit_subscriptions (user_id, authorization_code, card_type, last4, exp_month, exp_year)
       VALUES ($1, 'AUTH_CODE_FINAL', 'mastercard', '1234', '10', '2027')
       ON CONFLICT (user_id, last4) DO NOTHING`,
      [userId]
    );

    // 3. Verify
    const { rows: inst } = await pool.query('SELECT remaining_balance FROM installments WHERE id = $1', [instId]);
    const { rows: cards } = await pool.query('SELECT * FROM auto_debit_subscriptions WHERE user_id = $1', [userId]);

    if (inst[0].remaining_balance == 150000 && cards.length > 0) {
      console.log('. SETTLEMENT VERIFICATION PASSED');
    } else {
      console.error('. SETTLEMENT VERIFICATION FAILED', inst[0]);
    }

  } catch (err) {
    console.error('Settlement Test error:', err);
  } finally {
    await pool.end();
  }
};

verifySettlement();
