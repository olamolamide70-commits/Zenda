const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const seedUsers = async () => {
  const password = await bcrypt.hash('Password123@', 10);
  
  const superAdmins = [
    { name: 'Olasubomi Makinde', email: 'makindeolasubomi5@gmail.com', role: 'super_admin' }
  ];

  const admins = [
    { name: 'Tunde Afolayan', email: 'tunde.admin@gadgetflex.com.ng', role: 'admin' }
  ];

  const Merchants = [
    { name: 'Slot Systems', email: 'info@slot.ng', role: 'merchant' },
    { name: 'Pointek Nigeria', email: 'sales@pointek.ng', role: 'merchant' },
    { name: 'Jumia Nigeria', email: 'merchant@jumia.com.ng', role: 'merchant' },
    { name: 'Konga Online', email: 'marketplace@konga.com', role: 'merchant' },
    { name: 'MicroStation', email: 'support@microstation.ng', role: 'merchant' },
    { name: 'Finet Mobile', email: 'hello@finet.ng', role: 'merchant' },
    { name: '3C Hub', email: 'contact@3chub.ng', role: 'merchant' },
    { name: 'Best Buy Nigeria', email: 'store@bestbuy.com.ng', role: 'merchant' },
    { name: 'Kara Nigeria', email: 'sales@kara.com.ng', role: 'merchant' },
    { name: 'Dreamworks', email: 'info@dreamworks.ng', role: 'merchant' },
    { name: 'Spar Nigeria', email: 'tech@spar.com.ng', role: 'merchant' },
    { name: 'Game Nigeria', email: 'gaming@game.com.ng', role: 'merchant' },
    { name: 'Shoprite Tech', email: 'electronics@shoprite.ng', role: 'merchant' },
    { name: 'Hubmart Gadgets', email: 'gadgets@hubmart.com', role: 'merchant' },
    { name: 'Rhythems Mobile', email: 'rhythems@gmail.com', role: 'merchant' }
  ];

  const genericUsers = [
    { name: 'Chidi Okoro', email: 'chidi.okoro@example.com' },
    { name: 'Amina Bello', email: 'amina.bello@example.com' },
    { name: 'Olawale Johnson', email: 'olawale.j@example.com' },
    { name: 'Nneka Uzoma', email: 'nneka.u@example.com' },
    { name: 'Segun Arinze', email: 'segun.a@example.com' },
    { name: 'Chioma Adebayo', email: 'chioma.a@example.com' },
    { name: 'Ibrahim Musa', email: 'ibrahim.m@example.com' },
    { name: 'Blessing Eke', email: 'blessing.e@example.com' },
    { name: 'Emeka Nwosu', email: 'emeka.n@example.com' },
    { name: 'Fatima Zubairu', email: 'fatima.z@example.com' },
    { name: 'Sunday Dare', email: 'sunday.d@example.com' },
    { name: 'Yetunde Ojo', email: 'yetunde.o@example.com' },
    { name: 'Kelechi Iheanacho', email: 'kelechi.i@example.com' },
    { name: 'Zainab Ahmed', email: 'zainab.a@example.com' },
    { name: 'Abubakar Sadiq', email: 'abubakar.s@example.com' },
    { name: 'Joy Idoko', email: 'joy.i@example.com' },
    { name: 'Samuel Peters', email: 'samuel.p@example.com' },
    { name: 'Damilola Mike', email: 'damilola.m@example.com' },
    { name: 'Ezekiel Gani', email: 'ezekiel.g@example.com' },
    { name: 'Rosemary Obi', email: 'rosemary.o@example.com' }
  ];

  const customerService = [
    { name: 'Sarah Ifeanyi', email: 'sarah.cs@gadgetflex.com.ng', role: 'customer_care' },
    { name: 'Ahmed Lawal', email: 'ahmed.cs@gadgetflex.com.ng', role: 'customer_care' },
    { name: 'Uche Okafor', email: 'uche.cs@gadgetflex.com.ng', role: 'customer_care' },
    { name: 'Tosin Balogun', email: 'tosin.cs@gadgetflex.com.ng', role: 'customer_care' },
    { name: 'Miracle Ebube', email: 'miracle.cs@gadgetflex.com.ng', role: 'customer_care' }
  ];

  console.log('Starting migration to seed users...');

  try {
    // Combine all
    const allUsers = [
      ...superAdmins,
      ...admins,
      ...Merchants,
      ...genericUsers.map(u => ({ ...u, role: 'user' })),
      ...customerService
    ];

    for (const user of allUsers) {
      if (!user.name || !user.email || !user.role) {
        console.error('Invalid user data:', user);
        continue;
      }
      console.log(`Attempting to seed: ${user.name} (${user.role})`);
      await pool.query(
        `INSERT INTO users (name, email, password, role, is_verified) 
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (email) DO UPDATE SET 
           role = EXCLUDED.role,
           is_verified = TRUE`,
        [user.name, user.email, password, user.role]
      );
      console.log(`Success: ${user.name}`);
    }

    console.log('\n--- SEEDING COMPLETE ---');
    console.log(`Superadmins: ${superAdmins.length}`);
    console.log(`Admins: ${admins.length}`);
    console.log(`Merchants: ${Merchants.length}`);
    console.log(`Users: ${genericUsers.length}`);
    console.log(`Customer Service: ${customerService.length}`);
    console.log('--------------------------');

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
};

seedUsers();
