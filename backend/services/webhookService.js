const supabase = require('../config/supabase');

// Webhook Retry Delays in milliseconds: 5 mins, 30 mins, 2 hours, 6 hours, 15 hours
const RETRY_DELAYS = [
  300000,     // 5 minutes
  1800000,    // 30 minutes
  7200000,    // 2 hours
  21600000,   // 6 hours
  54000000    // 15 hours
];

/**
 * Dispatches a webhook payload to the merchant's configured endpoint.
 * Implements a strict 5-retry policy spanning 24 hours with exponential backoff on failure.
 * 
 * @param {string} merchantId - UUID of the merchant.
 * @param {string} eventType - The trigger event (e.g. 'installment.approved').
 * @param {object} payload - Actionable transaction/order data.
 * @param {number} attempt - Current dispatch attempt (starts at 1).
 */
exports.triggerWebhook = async (merchantId, eventType, payload, attempt = 1) => {
  try {
    // 1. Fetch merchant's active webhook URL
    const { data: merchant, error } = await supabase
      .from('users')
      .select('bank_details')
      .eq('id', merchantId)
      .single();

    if (error || !merchant || !merchant.bank_details?.webhook_url) {
      console.log(`[Webhook Debug] No webhook URL registered for merchant: ${merchantId}`);
      return;
    }

    const webhookUrl = merchant.bank_details.webhook_url;
    console.log(`[Webhook] Dispatching '${eventType}' to ${webhookUrl} (Attempt ${attempt}/6)`);

    let responseStatus = 0;
    let responseBody = '';
    let isSuccess = false;

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-zenda-signature': `sha256_mock_signature_${merchantId.slice(0, 8)}`
        },
        body: JSON.stringify({
          event: eventType,
          payload: payload,
          attempt: attempt,
          timestamp: new Date().toISOString()
        })
      });

      responseStatus = response.status;
      responseBody = await response.text();
      isSuccess = response.ok;
    } catch (err) {
      responseStatus = 500;
      responseBody = err.message;
    }

    // 2. Log webhook attempt to Supabase
    // If the merchant_webhook_logs table does not exist, we log gracefully to console to prevent crash
    const logData = {
      merchant_id: merchantId,
      event_type: eventType,
      payload: payload,
      response_status: responseStatus,
      response_body: responseBody.slice(0, 500),
      attempt_number: attempt,
      status: isSuccess ? 'success' : (attempt > 5 ? 'failed' : 'pending')
    };

    const { error: logError } = await supabase
      .from('merchant_webhook_logs')
      .insert([logData]);

    if (logError) {
      console.log('--- [WEBHOOK LOG FALLBACK] ---');
      console.log('Target:', webhookUrl);
      console.log('Event:', eventType);
      console.log('Status:', isSuccess ? 'SUCCESS' : 'FAILED');
      console.log('Attempt:', `${attempt}/6`);
      console.log('------------------------------');
    }

    // 3. Trigger retries if attempt failed and limits are not reached
    if (!isSuccess && attempt <= 5) {
      const delay = RETRY_DELAYS[attempt - 1];
      console.log(`[Webhook] Delivery failed (HTTP ${responseStatus}). Retry ${attempt} scheduled in ${delay / 60000} minutes.`);
      
      setTimeout(() => {
        exports.triggerWebhook(merchantId, eventType, payload, attempt + 1);
      }, delay);
    } else if (isSuccess) {
      console.log(`[Webhook] Delivery SUCCESS to ${webhookUrl} on attempt ${attempt}`);
    } else {
      console.log(`[Webhook] Max retries reached for event ${eventType} to ${webhookUrl}. Logged as failed.`);
    }

  } catch (error) {
    console.error('[Webhook System Critical Error]:', error.message);
  }
};
