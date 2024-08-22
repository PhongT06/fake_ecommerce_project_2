import React from 'react';

function OrderReview({ shippingInfo, paymentInfo, cartItems, onPlaceOrder }) {
   const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

   // Helper function to safely get nested properties
   const getNestedProperty = (obj, path) => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
   };

   // Determine the last 4 digits of the card
   const cardLast4 = getNestedProperty(paymentInfo, 'paymentMethod.card.last4') 
      || getNestedProperty(paymentInfo, 'card.last4')
      || 'N/A';

   console.log('Payment Info:', paymentInfo); // For debugging

   return (
      <div className="space-y-4">
         <h3 className="text-xl font-bold">Order Review</h3>
         <div>
            <h4 className="font-bold">Shipping Information</h4>
            <p>{shippingInfo.name}</p>
            <p>{shippingInfo.address}</p>
            <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}</p>
            <p>{shippingInfo.country}</p>
         </div>
         <div>
            <h4 className="font-bold">Payment Information</h4>
            <p>Card ending in {cardLast4}</p>
         </div>
         <div>
            <h4 className="font-bold">Order Items</h4>
            {cartItems.map(item => (
               <div key={item.product_id} className="flex justify-between">
                  <span>{item.title} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
               </div>
            ))}
         </div>
         <div className="font-bold">
            Total: ${total.toFixed(2)}
         </div>
         <button 
            onClick={onPlaceOrder}
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
         >
            Place Order
         </button>
      </div>
   );
}

export default OrderReview;