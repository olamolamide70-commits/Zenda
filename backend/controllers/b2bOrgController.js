const supabase = require('../config/supabase');

/**
 * B2B Organization & Procurement Controller
 * 
 * Manages company registration, employee onboarding, corporate lines, 
 * and purchase order approval loops.
 */

// 1. Onboard a new business organization
exports.registerOrganization = async (req, res) => {
  const { name, tin, cac_number, cac_url } = req.body;
  const adminId = req.user.id;

  try {
    // Check if user is already linked to an organization
    const { data: profile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', adminId)
      .single();

    if (profile?.organization_id) {
      return res.status(400).json({ error: 'User is already associated with an active organization' });
    }

    // Insert new organization (Default Base Credit Limit: ₦10,000,000)
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([{
        name,
        tin,
        cac_number,
        cac_url,
        credit_limit: 10000000.00,
        outstanding_balance: 0.00,
        kyc_status: 'pending'
      }])
      .select()
      .single();

    if (orgError) throw orgError;

    // Link the registering user as the company_admin
    await supabase
      .from('users')
      .update({
        organization_id: org.id,
        company_role: 'company_admin'
      })
      .eq('id', adminId);

    res.status(201).json({
      message: 'Business profile successfully registered. KYC verification is pending.',
      organization: org
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Admin invites an employee to their organization
exports.inviteUser = async (req, res) => {
  const { email, role = 'company_buyer' } = req.body;
  const adminId = req.user.id;

  try {
    // Ensure the requester is a company_admin and get their organization_id
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('organization_id, company_role')
      .eq('id', adminId)
      .single();

    if (adminErr || adminUser?.company_role !== 'company_admin' || !adminUser?.organization_id) {
      return res.status(403).json({ error: 'Access denied. Requester is not an active organization administrator' });
    }

    // Find the user to invite
    const { data: invitee, error: inviteeErr } = await supabase
      .from('users')
      .select('id, name, organization_id')
      .eq('email', email)
      .single();

    if (inviteeErr || !invitee) {
      return res.status(404).json({ error: 'No Zenda user found with the provided email address' });
    }

    if (invitee.organization_id) {
      return res.status(400).json({ error: 'Selected user is already linked to an organization' });
    }

    // Link the user to the organization with the specified role
    const { data: updatedUser, error: updateErr } = await supabase
      .from('users')
      .update({
        organization_id: adminUser.organization_id,
        company_role: role
      })
      .eq('id', invitee.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.json({
      message: `Successfully onboarded ${invitee.name} to your organization as a ${role}`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        company_role: updatedUser.company_role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Admin audits pending orders from their buyers
exports.getOrganizationOrders = async (req, res) => {
  const adminId = req.user.id;

  try {
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('organization_id, company_role')
      .eq('id', adminId)
      .single();

    if (adminErr || adminUser?.company_role !== 'company_admin' || !adminUser?.organization_id) {
      return res.status(403).json({ error: 'Access denied. Requester is not an active organization administrator' });
    }

    // Fetch all orders placed by members of this organization that require B2B approval
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('*, products:product_id(name, brand, image_url), users:user_id(name, email)')
      .eq('is_b2b', true)
      .eq('approved_by_admin', false)
      .is('rejection_reason', null);

    if (ordersErr) throw ordersErr;

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Admin approves or declines a buyer procurement request
exports.approveProcurementOrder = async (req, res) => {
  const { id } = req.params;
  const { approve = true, reason } = req.body;
  const adminId = req.user.id;

  try {
    // 1. Verify admin credentials
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('organization_id, company_role')
      .eq('id', adminId)
      .single();

    if (adminErr || adminUser?.company_role !== 'company_admin' || !adminUser?.organization_id) {
      return res.status(403).json({ error: 'Access denied. Requester is not an active organization administrator' });
    }

    // 2. Fetch order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderErr || !order) return res.status(404).json({ error: 'Procurement order not found' });

    // 3. Process Approval / Rejection
    if (!approve) {
      // Reject Order
      const { data: updatedOrder, error: rejectErr } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          rejection_reason: reason || 'Declined by corporate administrator.'
        })
        .eq('id', id)
        .select()
        .single();

      if (rejectErr) throw rejectErr;
      return res.json({ message: 'Procurement request successfully declined', order: updatedOrder });
    }

    // Approve Order
    // Enforce Corporate Credit Limits verification
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', adminUser.organization_id)
      .single();

    if (orgErr || !org) throw new Error('Company corporate line parameters not found');

    const totalCost = Number(order.amount);
    const availableCredit = Number(org.credit_limit) - Number(org.outstanding_balance);

    if (totalCost > availableCredit) {
      return res.status(400).json({ error: `Insufficient corporate credit line. Purchase requires ₦${totalCost.toLocaleString()}, but available limit is only ₦${availableCredit.toLocaleString()}.` });
    }

    // Deduct credit limits
    const newOutstanding = Number(org.outstanding_balance) + totalCost;
    await supabase
      .from('organizations')
      .update({ outstanding_balance: newOutstanding })
      .eq('id', org.id);

    // Update order status to active and approve it
    const { data: approvedOrder, error: approveErr } = await supabase
      .from('orders')
      .update({
        approved_by_admin: true,
        status: 'processing'
      })
      .eq('id', id)
      .select()
      .single();

    if (approveErr) throw approveErr;

    res.json({
      message: 'Procurement request successfully approved and dispatched for packaging.',
      order: approvedOrder
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
