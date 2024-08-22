import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../utils/api';

function PaymentForm({ onSubmit }) {
   const stripe = useStripe();
   const elements = useElements();
   const [error, setError] = useState(null);
   const [processing, setProcessing] = useState(false);
   const [clientSecret, setClientSecret] = useState('');

   useEffect(() => {
      async function createPaymentIntent() {
         try {
            const response = await api.post("/checkout/create-payment-intent", { amount: 1000 });
            setClientSecret(response.data.clientSecret);
         } catch (err) {
            console.error("Error creating payment intent:", err.response ? err.response.data : err.message);
            setError("Failed to create payment intent. " + (err.response ? err.response.data.error : err.message));
         }
      }
      createPaymentIntent();
   }, []);

   const handleSubmit = async (event) => {
      event.preventDefault();
      setProcessing(true);

      if (!stripe || !elements) {
         return;
      }

      try {
         const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
               card: elements.getElement(CardElement),
            },
         });

         if (result.error) {
            setError(result.error.message);
         } else {
            onSubmit(result.paymentIntent);
         }
      } catch (err) {
         setError('An error occurred while processing your payment.');
      }

      setProcessing(false);
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         <div>
            <label htmlFor="card-element" className="block mb-1">Credit or debit card</label>
            <CardElement
               id="card-element"
               className="w-full px-3 py-2 border rounded"
            />
         </div>
         {error && <div className="text-red-500">{error}</div>}
         <button 
            type="submit" 
            disabled={!stripe || processing || !clientSecret} 
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
         >
            {processing ? 'Processing...' : 'Pay'}
         </button>
      </form>
   );
}

export default PaymentForm;