# M-Pesa Daraja Integration Guide

## Overview

This project implements a payment page with M-Pesa Daraja API integration. The implementation includes:

1. A beautifully designed payment form
2. Real-time payment status tracking
3. Transaction receipts
4. Supabase Edge Function for secure API integration

## Integration Architecture

The integration follows a client-server architecture:

1. **Frontend**: React application with payment form, status monitoring, and receipt display
2. **Backend**: Supabase Edge Function that securely communicates with the M-Pesa Daraja API

## Required Environment Variables

For the Edge Function to work, you need to set these environment variables in your Supabase project:

- `MPESA_CONSUMER_KEY` - Your Safaricom Daraja API consumer key
- `MPESA_CONSUMER_SECRET` - Your Safaricom Daraja API consumer secret
- `MPESA_BUSINESS_SHORT_CODE` - Your M-Pesa short code or PayBill number
- `MPESA_PASSKEY` - Your M-Pesa passkey
- `ENVIRONMENT` - Set to "sandbox" for testing or "production" for live

## Production Considerations

1. **API Security**: Never expose API keys or secrets in your frontend code
2. **Error Handling**: Implement comprehensive error handling and retry logic
3. **Validation**: Always validate phone numbers and payment amounts
4. **Logging**: Implement proper logging for debugging and audit trails
5. **Callbacks**: Set up reliable callback handling for payment notifications

## Daraja API Documentation

For complete documentation on the M-Pesa Daraja API, visit:
https://developer.safaricom.co.ke/

## Testing

Use the Safaricom sandbox environment for testing:
- Test phone number: 254708374149
- Test PIN: 174379

## Troubleshooting

Common issues:
1. Invalid phone number format - ensure numbers are in the format 254XXXXXXXXX
2. Callback URL not reachable - ensure your callback URL is publicly accessible
3. Authentication errors - check that your API keys are correct
4. Transaction failures - ensure sufficient funds in test accounts

## Support

For technical issues with the Daraja API, contact Safaricom Developer Support.
For issues with this implementation, please open an issue in the project repository.