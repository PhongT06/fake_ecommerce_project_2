import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
   return (
      <div className="container mx-auto mt-8">
         <h1 className="text-4xl font-bold mb-4">Welcome to our E-commerce Store</h1>
         <p className="mb-4">Discover our amazing products!</p>
         <Link to="/products" className="bg-blue-500 text-white px-4 py-2 rounded">
         Shop Now
         </Link>
      </div>
   );
}

export default Home;