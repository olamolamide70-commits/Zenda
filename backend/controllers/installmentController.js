const supabase = require('../config/supabase');

const calculateInstallments = (price, duration, frequency, interestDiscount = 0, insurancePremium = 0) => {
  const baseRate = 0.05; // 5% flat
  const effectiveRate = Math.max(0, baseRate - (interestDiscount / 100));
  
  const priceWithInterest = price * (1 + effectiveRate * (duration / 12));
  const totalWithInsurance = priceWithInterest + (insurancePremium * duration);
  
  let divisor;
  switch (frequency) {
    case 'daily': divisor = duration * 30; break;
    case 'weekly': divisor = duration * 4; break;
    case 'monthly': divisor = duration; break;
    default: divisor = duration;
  }

  const installmentAmount = Math.ceil(totalWithInsurance / divisor);
  const totalPayable = installmentAmount * divisor;

  return { installmentAmount, totalPayable, periods: divisor };
};

exports.createPlan = async (req, res) => {
  const { productId, duration, frequency, insuranceId } = req.body;
  const userId = req.user.id;

  // Enforce KYC requirement (NIN and BVN) for installments
  if (!req.user.nin || !req.user.bvn) {
    return res.status(400).json({ 
      error: 'KYC Required: Please complete your profile by adding your Bank Verification Number (BVN) and National Identification Number (NIN) to start an installment plan.' 
    });
  }

  try {
    // 1. Get product info
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) throw new Error('Product not found');

    // 2. Calculate plan
    const { installmentAmount, totalPayable, periods } = calculateInstallments(
      product.price, 
      duration, 
      frequency, 
      req.user.interest_discount || 0,
      0 // Insurance premium simplified for now
    );

    // 3. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          product_id: productId,
          amount: totalPayable,
          plan: `${duration} months ${frequency}`,
          status: 'pending',
          payment_status: 'unpaid'
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 4. Create Installment Plan
    const { data: plan, error: planError } = await supabase
      .from('installments')
      .insert([
        {
          order_id: order.id,
          user_id: userId,
          total_installments: periods,
          frequency,
          total_amount: totalPayable,
          remaining_balance: totalPayable,
          next_payment_date: new Date(Date.now() + 86400000).toISOString(),
          status: 'active'
        }
      ])
      .select()
      .single();

    if (planError) throw planError;

    res.status(201).json({ order, plan, installmentAmount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getSchedule = async (req, res) => {
  const { planId } = req.params;
  try {
    const { data: plan, error } = await supabase
      .from('installments')
      .select('*, orders(*, products(*))')
      .eq('id', planId)
      .single();

    if (error || !plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserInstallments = async (req, res) => {
  try {
    const { data: installments, error } = await supabase
      .from('installments')
      .select(`
        *,
        orders:order_id (
          id,
          total_amount:amount,
          created_at,
          products:product_id (
            name,
            image_url
          )
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const result = installments.map(i => ({
      ...i,
      product_name: i.orders?.products?.name,
      image_url: i.orders?.products?.image_url,
      order_total: i.orders?.total_amount,
      order_date: i.orders?.created_at,
      auto_debit_active: false // To be implemented with transactions
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
