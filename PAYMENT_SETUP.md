# Stripe & PayPal Payment Integration - Setup Instructions

## Step 1: Install Required Packages

Run the following command to install Stripe and PayPal dependencies:

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js @paypal/react-paypal-js
```

## Step 2: Remove Razorpay (Optional)

If you want to completely remove Razorpay:

```bash
npm uninstall razorpay
```

Then delete these files:
- `src/lib/razorpay.ts`
- `src/components/payment/RazorpayScript.tsx`
- `src/app/api/payment/create-order/route.ts` (old Razorpay endpoint)
- `src/app/api/payment/verify/route.ts` (old Razorpay endpoint)

## Step 3: Get Stripe API Keys

1. Sign up at https://stripe.com
2. Go to Dashboard → Developers → API Keys
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)
5. For webhooks: Go to Developers → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/payment/stripe/webhook`
   - Events: Select `payment_intent.succeeded` and `payment_intent.payment_failed`
   - Copy the **Signing secret** (starts with `whsec_`)

## Step 4: Get PayPal API Keys

1. Sign up at https://developer.paypal.com
2. Go to Dashboard → My Apps & Credentials
3. Create a new app (or use Sandbox app)
4. Copy your **Client ID**
5. Show and copy your **Secret**
6. For webhooks: Go to Webhooks → Add Webhook
   - URL: `https://yourdomain.com/api/payment/paypal/webhook`
   - Events: Select `PAYMENT.CAPTURE.COMPLETED` and `PAYMENT.CAPTURE.DENIED`
   - Copy the **Webhook ID**

## Step 5: Update Environment Variables

Add the following to your `.env.local` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key
STRIPE_SECRET_KEY=sk_test_your_actual_secret
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret

# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_actual_client_id
PAYPAL_CLIENT_SECRET=your_actual_secret
PAYPAL_WEBHOOK_ID=your_actual_webhook_id
```

## Step 6: Restart Development Server

After updating environment variables, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Step 7: Test Payments

### Test Stripe Payments

Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC will work.

### Test PayPal Payments

1. Use PayPal Sandbox accounts (created in developer dashboard)
2. Or use your personal PayPal account in sandbox mode

## Step 8: Production Setup

When ready for production:

1. **Stripe**: Switch to live API keys (start with `pk_live_` and `sk_live_`)
2. **PayPal**: Switch to production credentials
3. **Update webhook URLs** to your production domain
4. **Test thoroughly** with small amounts before going live

## Troubleshooting

### "Stripe not configured" error
- Make sure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` are set
- Restart your dev server after adding environment variables

### "PayPal not configured" error
- Make sure `NEXT_PUBLIC_PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set
- Check that the client ID is the public one (not the secret)

### Payment intent creation fails
- Check server console for detailed error messages
- Verify API keys are correct (no extra spaces)
- Ensure you're using test mode keys during development

## Next Steps

After setup is complete:
1. Test both payment methods thoroughly
2. Implement order creation in Firestore
3. Set up webhook handlers for payment confirmation
4. Add email notifications
5. Create order confirmation page

## Support

- **Stripe Docs**: https://stripe.com/docs
- **PayPal Docs**: https://developer.paypal.com/docs
- **Stripe Testing**: https://stripe.com/docs/testing
- **PayPal Sandbox**: https://developer.paypal.com/tools/sandbox
