import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import SearchResults from './pages/SearchResults';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
   return (
      <AuthProvider>
         <Elements stripe={stripePromise}>
            <Router>
               <div className="App">
                  <Navbar />
                  <Routes>
                     <Route path="/" element={<Home />} />
                     <Route path="/products" element={<Products />} />
                     <Route path="/products/:id" element={<ProductDetails />} />
                     <Route path="/cart" element={<Cart />} />
                     <Route path="/login" element={<Login />} />
                     <Route path="/register" element={<Register />} />
                     <Route path="/profile" element={<Profile />} />
                     <Route path="/checkout" element={<Checkout />} />
                     <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                     <Route path="/order-history" element={<OrderHistory />} />
                     <Route path="/search" element={<SearchResults />} />
                     <Route 
                        path="/admin" 
                        element={
                           <ProtectedRoute isAdmin>
                              <AdminDashboard />
                           </ProtectedRoute>
                        } 
                     />
                     <Route 
                        path="/admin/products" 
                        element={
                           <ProtectedRoute isAdmin>
                              <AdminProducts />
                           </ProtectedRoute>
                        } 
                     />
                     <Route 
                        path="/admin/orders" 
                        element={
                           <ProtectedRoute isAdmin>
                              <AdminOrders />
                           </ProtectedRoute>
                        } 
                     />
                     <Route 
                        path="/admin/users" 
                        element={
                           <ProtectedRoute isAdmin>
                              <AdminUsers />
                           </ProtectedRoute>
                        } 
                     />
                  </Routes>
               </div>
            </Router>
         </Elements>
      </AuthProvider>
   );
}

export default App;