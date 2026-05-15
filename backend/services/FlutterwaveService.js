/**
 * FlutterwaveService
 * 
 * Logic to handle bank transfers to vendors.
 */

const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);

class FlutterwaveService {
  /**
   * Initiate a transfer to a vendor's bank account
   * @param {Object} details { account_bank, account_number, amount, narration, currency, reference }
   */
  async initiateTransfer(details) {
    try {
      const payload = {
        account_bank: details.account_bank,
        account_number: details.account_number,
        amount: details.amount,
        narration: details.narration || "Zenda Vendor Payout",
        currency: details.currency || "NGN",
        reference: details.reference || `GF-V-PO-${Date.now()}`,
        callback_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/webhooks/flutterwave`,
        debit_currency: "NGN"
      };

      const response = await flw.Transfer.initiate(payload);
      return response;
    } catch (error) {
      console.error('Flutterwave Transfer Error:', error);
      throw error;
    }
  }

  /**
   * Fetch list of banks for UI selection
   */
  async getBanks(country = 'NG') {
    try {
      const response = await flw.Bank.country({ country });
      return response.data;
    } catch (error) {
      console.error('Fetch Banks Error:', error);
      return [];
    }
  }
}

module.exports = new FlutterwaveService();
