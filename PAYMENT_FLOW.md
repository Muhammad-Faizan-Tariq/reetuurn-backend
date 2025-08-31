# Return Order Payment Flow

This document explains the new payment flow for creating return orders with Stripe integration.

## Flow Overview

1. **Create Payment Intent** - Calculate amount and create Stripe payment intent
2. **Complete Payment** - User completes payment on frontend using Stripe
3. **Confirm Payment & Create Order** - Backend verifies payment and creates order

## API Endpoints

### 1. Create Payment Intent
```
POST /api/return-orders/payment-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "packages": [
    {
      "size": "medium",
      "dimensions": "20x15x10",
      "labelAttached": true,
      "carrier": "DHL"
    }
  ],
  "paymentMethod": "stripe_card",
  "currency": "EUR"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment intent created successfully",
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "amount": 699,
    "currency": "eur",
    "paymentIntentId": "pi_xxx"
  }
}
```

### 2. Complete Payment (Frontend)
```javascript
// Using Stripe.js
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: elements.getElement('card'),
    billing_details: {
      name: 'Customer Name',
    },
  }
});

if (error) {
  // Handle error
} else {
  // Payment successful, proceed to confirm
}
```

### 3. Confirm Payment & Create Order
```
POST /api/return-orders/confirm-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx",
  "orderData": {
    "pickupAddress": {
      "building": "123 Main St",
      "floor": "2",
      "doorNumber": "A",
      "directions": "Near the elevator",
      "contactPhone": "+1234567890"
    },
    "packages": [
      {
        "size": "medium",
        "dimensions": "20x15x10",
        "labelAttached": true,
        "carrier": "DHL"
      }
    ],
    "schedule": {
      "date": "2024-01-15T10:00:00.000Z",
      "timeWindow": {
        "start": "09:00",
        "end": "12:00"
      }
    },
    "paymentMethod": "stripe_card",
    "currency": "EUR"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed and return order created successfully",
  "data": {
    "order": {
      "id": "order_id",
      "orderNumber": "RTN-1234567890-123",
      "status": "pending",
      "payment": {
        "status": "completed",
        "amount": 6.99,
        "currency": "EUR"
      }
    },
    "receipt": {
      "id": "receipt_id",
      "generatedAt": "2024-01-10T10:00:00.000Z"
    }
  }
}
```

## Package Pricing

- **Small**: €4.99
- **Medium**: €6.99  
- **Large**: €8.99
- **XLarge**: €10.99

## Payment Methods Supported

- `stripe_card` - Credit/Debit Card
- `stripe_klarna` - Klarna
- `stripe_google_pay` - Google Pay
- `paypal` - PayPal

## Security Features

1. **Payment Verification**: Backend verifies payment intent status before creating order
2. **Amount Validation**: Amount is calculated server-side and verified against payment intent
3. **User Authentication**: All endpoints require valid JWT token
4. **Input Validation**: Comprehensive validation for all input data

## Error Handling

- Invalid payment intent status
- Payment amount mismatch
- Validation errors
- Database errors
- Stripe API errors

## Frontend Integration Example

```javascript
// Step 1: Create payment intent
const paymentIntentResponse = await fetch('/api/return-orders/payment-intent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    packages: orderData.packages,
    paymentMethod: 'stripe_card',
    currency: 'EUR'
  })
});

const { data: { clientSecret } } = await paymentIntentResponse.json();

// Step 2: Complete payment with Stripe
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: customerName }
  }
});

if (error) {
  console.error('Payment failed:', error);
} else {
  // Step 3: Confirm payment and create order
  const orderResponse = await fetch('/api/return-orders/confirm-payment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      paymentIntentId: paymentIntent.id,
      orderData: orderData
    })
  });

  const result = await orderResponse.json();
  console.log('Order created:', result);
}
```
