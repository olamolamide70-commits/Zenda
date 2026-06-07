const supabase = require('./config/supabase');

const products = [
  {
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    category: "Phones",
    price: 1200000,
    description: "The ultimate iPhone with Titanium design, A17 Pro chip, and the most powerful camera system yet.",
    image_url: "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=2070&auto=format&fit=crop",
    inventory: 15,
    rating: 4.9,
    specs: { "Storage": "256GB/512GB/1TB", "Display": "6.7-inch OLED", "Chip": "A17 Pro" },
    installment_eligible: true
  },
  {
    name: "MacBook Pro M3",
    brand: "Apple",
    category: "Laptops",
    price: 2500000,
    description: "The most advanced chips ever built for a personal computer. M3, M3 Pro, and M3 Max.",
    image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2026&auto=format&fit=crop",
    inventory: 8,
    rating: 4.8,
    specs: { "RAM": "16GB/32GB/64GB", "Storage": "512GB/1TB", "Display": "14-inch Liquid Retina" },
    installment_eligible: true
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Phones",
    price: 1100000,
    description: "Galaxy AI is here. Welcome to the era of mobile AI. With S24 Ultra, you can unleash whole new levels of creativity.",
    image_url: "https://images.unsplash.com/photo-1707148766904-4581457199c3?q=80&w=1974&auto=format&fit=crop",
    inventory: 12,
    rating: 4.7,
    specs: { "Storage": "256GB/512GB", "Camera": "200MP Main", "S-Pen": "Included" },
    installment_eligible: true
  },
  {
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "Accessories",
    price: 450000,
    description: "Industry-leading noise cancellation. Crystal-clear hands-free calling. Up to 30-hour battery life.",
    image_url: "https://images.unsplash.com/photo-1644737554462-89946ee9957d?q=80&w=2070&auto=format&fit=crop",
    inventory: 20,
    rating: 4.9,
    specs: { "Battery": "30 Hours", "Noise Cancelling": "Yes", "Connection": "Bluetooth 5.2" },
    installment_eligible: true
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    const { data, error } = await supabase
      .from('products')
      .insert(products);

    if (error) throw error;

    console.log('. Marketplace seeded successfully with premium gadgets!');
  } catch (error) {
    console.error('. Error seeding database:', error.message);
  }
}

seedDatabase();
