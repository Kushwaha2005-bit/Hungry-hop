// ============================================
//  data.js — All static app data
// ============================================

export const CATEGORIES = [
  { emoji: '🍕', name: 'Pizza',    count: 45 },
  { emoji: '🍔', name: 'Burgers',  count: 62 },
  { emoji: '🍜', name: 'Noodles',  count: 38 },
  { emoji: '🥗', name: 'Salads',   count: 29 },
  { emoji: '🍣', name: 'Sushi',    count: 24 },
  { emoji: '🌮', name: 'Tacos',    count: 31 },
  { emoji: '🍦', name: 'Desserts', count: 53 },
  { emoji: '🥤', name: 'Drinks',   count: 47 },
];

export const RESTAURANTS = [
  {
    id: 1, name: 'Pizza Palace',
    cuisine: 'Italian • Pizza • Pasta',
    rating: 4.8, reviews: 1240, deliveryTime: '25-35 min',
    deliveryFee: '₹30', minOrder: '₹199',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
    logo: '🍕', tags: ['veg', 'non-veg'], offer: '20% OFF',
    distance: '1.2 km', isOpen: true,
  },
  {
    id: 2, name: 'Burger Barn',
    cuisine: 'American • Burgers • Fries',
    rating: 4.7, reviews: 980, deliveryTime: '20-30 min',
    deliveryFee: '₹25', minOrder: '₹149',
    img: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80',
    logo: '🍔', tags: ['non-veg'], offer: 'Free Fries',
    distance: '0.8 km', isOpen: true,
  },
  {
    id: 3, name: 'Sushi Sky',
    cuisine: 'Japanese • Sushi • Ramen',
    rating: 4.9, reviews: 756, deliveryTime: '30-45 min',
    deliveryFee: '₹50', minOrder: '₹299',
    img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
    logo: '🍣', tags: ['non-veg'], offer: '15% OFF',
    distance: '2.1 km', isOpen: true,
  },
  {
    id: 4, name: 'Green Garden',
    cuisine: 'Healthy • Salads • Bowls',
    rating: 4.6, reviews: 530, deliveryTime: '15-25 min',
    deliveryFee: 'FREE', minOrder: '₹199',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    logo: '🥗', tags: ['veg', 'healthy'], offer: 'Free Delivery',
    distance: '0.5 km', isOpen: true,
  },
  {
    id: 5, name: 'Taco Town',
    cuisine: 'Mexican • Tacos • Burritos',
    rating: 4.7, reviews: 670, deliveryTime: '20-30 min',
    deliveryFee: '₹35', minOrder: '₹179',
    img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
    logo: '🌮', tags: ['non-veg'], offer: '2+1 Offer',
    distance: '1.6 km', isOpen: true,
  },
  {
    id: 6, name: 'Sweet Cravings',
    cuisine: 'Desserts • Cakes • Ice Cream',
    rating: 4.8, reviews: 890, deliveryTime: '20-35 min',
    deliveryFee: '₹20', minOrder: '₹99',
    img: 'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=600&q=80',
    logo: '🍦', tags: ['veg'], offer: '10% OFF',
    distance: '1.0 km', isOpen: false,
  },
  {
    id: 7, name: 'Noodle House',
    cuisine: 'Chinese • Noodles • Dim Sum',
    rating: 4.5, reviews: 445, deliveryTime: '25-40 min',
    deliveryFee: '₹40', minOrder: '₹249',
    img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
    logo: '🍜', tags: ['veg', 'non-veg'], offer: 'Free Spring Roll',
    distance: '2.4 km', isOpen: true,
  },
  {
    id: 8, name: 'Spice Route',
    cuisine: 'Indian • Biryani • Curry',
    rating: 4.9, reviews: 1580, deliveryTime: '30-45 min',
    deliveryFee: '₹30', minOrder: '₹249',
    img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
    logo: '🍛', tags: ['veg', 'non-veg'], offer: '25% OFF',
    distance: '1.8 km', isOpen: true,
  },
];

export const FOODS = [
  { id: 1,  name: 'Margherita Pizza',     category: 'Pizza',    price: 299, oldPrice: 399, rating: 4.8, badge: 'bestseller', badgeClass: 'bestseller', desc: 'Classic tomato base, fresh mozzarella, basil leaves, olive oil drizzle.', img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80', tags: ['veg','popular'] },
  { id: 2,  name: 'Chicken Burger',       category: 'Burgers',  price: 199, oldPrice: 249, rating: 4.7, badge: '🔥 Hot',      badgeClass: '',           desc: 'Crispy fried chicken, lettuce, tomato, special sauce, brioche bun.',    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', tags: ['non-veg','popular'] },
  { id: 3,  name: 'Veggie Ramen',         category: 'Noodles',  price: 249, oldPrice: 299, rating: 4.6, badge: 'Veg',         badgeClass: 'veg',        desc: 'Rich miso broth, soft-boiled egg, bamboo shoots, mushrooms, noodles.',  img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80', tags: ['veg'] },
  { id: 4,  name: 'Avocado Toast',        category: 'Salads',   price: 179, oldPrice: 220, rating: 4.5, badge: 'Veg',         badgeClass: 'veg',        desc: 'Smashed avocado, cherry tomatoes, microgreens, everything bagel spice.', img: 'https://images.unsplash.com/photo-1603046891726-36bfd957e0bf?w=400&q=80', tags: ['veg','healthy'] },
  { id: 5,  name: 'Salmon Sushi Roll',    category: 'Sushi',    price: 399, oldPrice: 480, rating: 4.9, badge: 'bestseller', badgeClass: 'bestseller', desc: 'Fresh Atlantic salmon, cucumber, avocado, sesame, soy glaze.',          img: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80', tags: ['non-veg','popular'] },
  { id: 6,  name: 'Beef Tacos',           category: 'Tacos',    price: 229, oldPrice: 280, rating: 4.7, badge: '🔥 Hot',      badgeClass: '',           desc: 'Seasoned ground beef, pico de gallo, shredded cheese, sour cream.',     img: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80', tags: ['non-veg'] },
  { id: 7,  name: 'Chocolate Lava Cake',  category: 'Desserts', price: 149, oldPrice: 189, rating: 4.8, badge: 'bestseller', badgeClass: 'bestseller', desc: 'Warm chocolate cake with molten center, vanilla ice cream, berry coulis.',img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80', tags: ['veg','popular'] },
  { id: 8,  name: 'Mango Smoothie',       category: 'Drinks',   price: 99,  oldPrice: 129, rating: 4.6, badge: 'Veg',         badgeClass: 'veg',        desc: 'Alphonso mangoes, yogurt, honey, cardamom, crushed ice blend.',          img: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80', tags: ['veg','healthy'] },
  { id: 9,  name: 'Paneer Tikka',         category: 'Pizza',    price: 269, oldPrice: 320, rating: 4.7, badge: 'Veg',         badgeClass: 'veg',        desc: 'Tandoor-grilled paneer, capsicum, onion, mint chutney, lemon.',         img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80', tags: ['veg'] },
  { id: 10, name: 'BBQ Chicken Pizza',    category: 'Pizza',    price: 349, oldPrice: 429, rating: 4.8, badge: '🔥 Hot',      badgeClass: '',           desc: 'Smoky BBQ sauce, grilled chicken, caramelized onions, mozzarella.',     img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', tags: ['non-veg','popular'] },
  { id: 11, name: 'Double Smash Burger',  category: 'Burgers',  price: 279, oldPrice: 349, rating: 4.9, badge: 'bestseller', badgeClass: 'bestseller', desc: 'Double smashed beef patty, American cheese, pickles, secret sauce.',    img: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', tags: ['non-veg','popular'] },
  { id: 12, name: 'Veg Mushroom Burger',  category: 'Burgers',  price: 169, oldPrice: 219, rating: 4.5, badge: 'Veg',         badgeClass: 'veg',        desc: 'Crispy mushroom patty, lettuce, sriracha mayo, tomato, sesame bun.',    img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80', tags: ['veg','healthy'] },
  { id: 13, name: 'Pad Thai Noodles',     category: 'Noodles',  price: 229, oldPrice: 279, rating: 4.7, badge: '🔥 Hot',      badgeClass: '',           desc: 'Rice noodles, tofu, bean sprouts, egg, roasted peanuts, tamarind.',     img: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400&q=80', tags: ['veg','popular'] },
  { id: 14, name: 'Spicy Chicken Ramen',  category: 'Noodles',  price: 289, oldPrice: 349, rating: 4.8, badge: 'bestseller', badgeClass: 'bestseller', desc: 'Tonkotsu broth, chashu pork, soft-boiled egg, corn, nori, spicy paste.',img: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=400&q=80', tags: ['non-veg','popular'] },
  { id: 15, name: 'Caesar Salad',         category: 'Salads',   price: 199, oldPrice: 249, rating: 4.6, badge: 'Veg',         badgeClass: 'veg',        desc: 'Romaine lettuce, parmesan shavings, croutons, classic Caesar dressing.',  img: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80', tags: ['veg','healthy'] },
  { id: 16, name: 'Dragon Roll Sushi',    category: 'Sushi',    price: 449, oldPrice: 549, rating: 4.9, badge: 'bestseller', badgeClass: 'bestseller', desc: 'Shrimp tempura inside, avocado outside, spicy mayo, eel sauce drizzle.',  img: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80', tags: ['non-veg','popular'] },
  { id: 17, name: 'Chicken Quesadilla',   category: 'Tacos',    price: 249, oldPrice: 299, rating: 4.7, badge: '🔥 Hot',      badgeClass: '',           desc: 'Grilled chicken, cheddar cheese, salsa verde, sour cream, corn tortilla.',img: 'https://images.unsplash.com/photo-1611250503391-43c3f1958c19?w=400&q=80', tags: ['non-veg'] },
  { id: 18, name: 'Tiramisu',             category: 'Desserts', price: 179, oldPrice: 219, rating: 4.8, badge: 'bestseller', badgeClass: 'bestseller', desc: 'Lady fingers soaked in espresso, mascarpone cream, cocoa dusting.',       img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80', tags: ['veg','popular'] },
  { id: 19, name: 'Oreo Cheesecake',      category: 'Desserts', price: 159, oldPrice: 199, rating: 4.7, badge: 'Veg',         badgeClass: 'veg',        desc: 'Creamy cheesecake on Oreo crust, whipped cream, Oreo crumble topping.',  img: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80', tags: ['veg'] },
  { id: 20, name: 'Watermelon Cooler',    category: 'Drinks',   price: 89,  oldPrice: 119, rating: 4.5, badge: 'Veg',         badgeClass: 'veg',        desc: 'Fresh watermelon juice, mint leaves, lime, black salt, chilled blend.',   img: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&q=80', tags: ['veg','healthy'] },
  { id: 21, name: 'Cold Coffee Frappe',   category: 'Drinks',   price: 119, oldPrice: 149, rating: 4.7, badge: '🔥 Hot',      badgeClass: '',           desc: 'Strong cold brew, whipped cream, chocolate drizzle, ice blend delight.',  img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', tags: ['veg','popular'] },
];

export const TESTIMONIALS = [
  { name: 'Priya Sharma',  loc: 'Mumbai',    stars: 5, avatar: 'https://i.pravatar.cc/100?img=47', text: 'HungryHop never disappoints! Food arrives hot, fresh and exactly on time. My go-to app for weekend family dinners.' },
  { name: 'Rahul Mehta',   loc: 'Pune',      stars: 5, avatar: 'https://i.pravatar.cc/100?img=12', text: 'Amazing variety of restaurants and the interface is super clean. Delivery is always within the promised time. Highly recommend!' },
  { name: 'Ananya Singh',  loc: 'Delhi',     stars: 5, avatar: 'https://i.pravatar.cc/100?img=25', text: "The promo codes actually work and the food quality is consistently great. Best food delivery app I've tried so far!" },
  { name: 'Karan Patel',   loc: 'Ahmedabad', stars: 5, avatar: 'https://i.pravatar.cc/100?img=33', text: 'Love the real-time tracking feature. I always know exactly when my food will arrive. Customer support is also very responsive.' },
  { name: 'Meera Nair',    loc: 'Bangalore', stars: 5, avatar: 'https://i.pravatar.cc/100?img=56', text: 'Fantastic app with a huge selection. The filters make it easy to find vegetarian options. Delivery was faster than expected!' },
  { name: 'Arjun Das',     loc: 'Hyderabad', stars: 5, avatar: 'https://i.pravatar.cc/100?img=8',  text: 'The gorgeous design is matched by the amazing food. 10/10 would order again!' },
];

export const DEMO_ORDERS = {
  'HH-2024-0042': { step: 2, items: '3 items', total: '₹687',   dist: '2.4 km', eta: '18 mins',    times: ['2:14 PM', '2:20 PM', '2:32 PM', '~2:50 PM'] },
  'HH-2024-0039': { step: 3, items: '1 item',  total: '₹199',   dist: '1.1 km', eta: 'Delivered!', times: ['1:05 PM', '1:12 PM', '1:28 PM',  '1:42 PM'] },
  'HH-2024-0055': { step: 1, items: '5 items', total: '₹1,245', dist: '3.8 km', eta: '32 mins',    times: ['3:01 PM', '3:08 PM', '--',        '--'] },
};

export const PROMO_CODES = {
  'HOP20':   0.20,
  'SAVE10':  0.10,
  'FEAST20': 0.20,
};