import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCarousel from '../components/ProductCarousel';
import { ShoppingBag, Truck, Headphones, RefreshCw } from 'lucide-react';
import api from '../utils/api';

function Home() {
   const [featuredProducts, setFeaturedProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      fetchFeaturedProducts();
   }, []);

   const fetchFeaturedProducts = async () => {
      try {
         const response = await api.get('/products?limit=3');
         setFeaturedProducts(response.data);
         setLoading(false);
      } catch (err) {
         console.error('Error fetching featured products:', err);
         setError('Failed to fetch featured products. Please try again.');
         setLoading(false);
      }
   };

   return (
      <div className="bg-gray-100 min-h-screen">
         {/* Hero Section */}
         <section className="bg-blue-600 text-white py-20">
            <div className="container mx-auto text-center">
               <h1 className="text-5xl font-bold mb-4">Welcome to NeoVerse Market</h1>
               <p className="text-xl mb-8">Discover the future of shopping today</p>
               <Link to="/products" className="bg-white text-blue-600 py-3 px-8 rounded-full text-lg font-semibold hover:bg-blue-100 transition duration-300">
                  Shop Now
               </Link>
            </div>
         </section>

         {/* Featured Products */}
         <section className="py-16">
            <div className="container mx-auto">
               <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
               {loading ? (
                  <p className="text-center">Loading featured products...</p>
               ) : error ? (
                  <p className="text-center text-red-500">{error}</p>
               ) : (
                  <ProductCarousel products={featuredProducts} />
               )}
            </div>
         </section>

         {/* Benefits Section */}
         <section className="bg-white py-16">
            <div className="container mx-auto">
               <h2 className="text-3xl font-bold text-center mb-12">Why Choose NeoVerse Market?</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <BenefitCard icon={<ShoppingBag />} title="Wide Selection" description="Thousands of products at your fingertips" />
                  <BenefitCard icon={<Truck />} title="Fast Delivery" description="Get your orders in no time" />
                  <BenefitCard icon={<Headphones />} title="24/7 Support" description="We're always here to help" />
                  <BenefitCard icon={<RefreshCw />} title="Easy Returns" description="Hassle-free return policy" />
               </div>
            </div>
         </section>

         {/* Newsletter Section */}
         <section className="bg-gray-200 py-16">
            <div className="container mx-auto text-center">
               <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
               <p className="mb-8">Subscribe to our newsletter for the latest deals and updates</p>
               <form className="max-w-md mx-auto">
                  <div className="flex">
                     <input type="email" placeholder="Enter your email" className="flex-grow px-4 py-2 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-600" />
                     <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-r-full hover:bg-blue-700 transition duration-300">
                        Subscribe
                     </button>
                  </div>
               </form>
            </div>
         </section>
      </div>
   );
}

function BenefitCard({ icon, title, description }) {
   return (
      <div className="text-center p-6 bg-gray-100 rounded-lg hover:shadow-md transition duration-300">
         <div className="text-blue-600 text-4xl mb-4">{icon}</div>
         <h3 className="text-xl font-semibold mb-2">{title}</h3>
         <p className="text-gray-600">{description}</p>
      </div>
   );
}

export default Home;