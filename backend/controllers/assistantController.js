const Groq = require('groq-sdk');
const supabase = require('../config/supabase');

exports.chatWithAssistant = async (req, res) => {
  const { message } = req.body;

  try {
    let userContext = "The user is a Guest (not logged in).";
    let userName = "Explorer";

    if (req.user) {
      const userId = req.user.id;
      // Fetch user profile
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (user) {
        userName = user.name;
        const { data: installments } = await supabase
          .from('installments')
          .select('remaining_balance')
          .eq('user_id', userId)
          .eq('status', 'active');

        const activeDebt = (installments || []).reduce((sum, ins) => sum + (Number(ins.remaining_balance) || 0), 0);
        
        userContext = `
          User Context:
          - Name: ${user.name}
          - Tier: ${user.tier || 'Bronze'}
          - Credit Limit: ₦${user.credit_limit || 0}
          - Active Debt: ₦${activeDebt}
          - Risk Score: ${user.risk_score || 0}/100
        `;
      }
    }

    let aiResponse = "";

    try {
      if (process.env.GROQ_API_KEY) {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are Zenda AI, a high-end financial advisor for a premium gadget financing platform (formerly GadgetFlex).
              Your goal is to provide elite, data-driven advice.
              
              ${userContext}
              
              Guidelines:
              - Always refer to the platform as Zenda.
              - If the user is a guest, encourage them to sign up to see their personalized credit limit.
              - If the user has high debt, advise caution.
              - Keep responses professional, concise, and futuristic.`
            },
            { role: 'user', content: message }
          ],
          max_tokens: 512,
          temperature: 0.6,
        });
        aiResponse = completion.choices[0].message.content;
      } else {
        throw new Error('GROQ_API_KEY missing');
      }
    } catch (err) {
      console.warn('AI engine unavailable, falling back to mock system:', err.message);
      
      const msg = message.toLowerCase();
      if (msg.includes('daily') || msg.includes('plan')) {
        aiResponse = `Greetings ${userName}! Zenda's Daily Plan is the most efficient choice for consistency. Bit-by-bit rhythm helps protect your credit score.`;
      } else if (msg.includes('interest') || msg.includes('fee')) {
        aiResponse = "At Zenda, we believe in transparency. Our flat 5% service fee covers everything. Zero hidden charges, always.";
      } else {
        aiResponse = `Welcome to Zenda, ${userName}. I'm here to help you upgrade your tech with flexible payments. Sign in to view your personalized offers!`;
      }
    }
    
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('AI Assistant fatal error:', error.message);
    res.status(500).json({ error: 'Assistant temporarily unavailable.' });
  }
};
