import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import Products from './Products';

// Mock the api module
jest.mock('../utils/api', () => ({
   get: jest.fn(),
   post: jest.fn()
}));

import api from '../utils/api';

const renderWithProviders = (ui) => {
   return render(
      <AuthProvider>
         <CartProvider>
            <Router>
               {ui}
            </Router>
         </CartProvider>
      </AuthProvider>
   );
};

   describe('Products Component', () => {
      beforeEach(() => {
         api.get.mockResolvedValue({ data: [] });
      });
   
      test('renders products', async () => {
         api.get.mockResolvedValue({ data: [{ id: 1, title: 'Test Product', price: 10, image: 'test.jpg', category: 'Test' }] });
   
         renderWithProviders(<Products />);

         await waitFor(() => {
            const addToCartButton = screen.getAllByText('Add to Cart')[0];
            addToCartButton.click();
         });
   
         await waitFor(() => {
         expect(screen.getByText('Test Product added to cart!')).toBeInTheDocument();
         });
      });
   
      test('displays error when fetching products fails', async () => {
         api.get.mockRejectedValue(new Error('Failed to fetch products'));
   
         renderWithProviders(<Products />);
   
         await waitFor(() => {
         expect(screen.getByText('Failed to fetch products. Please try again.')).toBeInTheDocument();
         });
      });
   });