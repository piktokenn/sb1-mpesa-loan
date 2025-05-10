/**
 * M-Pesa Daraja API service
 * Note: This is a client-side implementation and should be moved to a backend
 * or edge function in a production environment for security.
 */

interface InitiatePaymentParams {
  phoneNumber: string;
  amount: number;
  description?: string;
}

interface InitiatePaymentResponse {
  transactionId: string;
  success: boolean;
  message: string;
}

// Simulate M-Pesa API response (for demo purposes)
export const initiateSTKPush = async ({
  phoneNumber,
  amount,
  description = 'Payment'
}: InitiatePaymentParams): Promise<InitiatePaymentResponse> => {
  // In a real implementation, this would make a request to your backend,
  // which would then call the M-Pesa API with proper authentication.
  
  console.log(`Initiating payment of KES ${amount} to ${phoneNumber} for: ${description}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate fake transaction ID
  const transactionId = `MPESA${Date.now().toString().substring(5)}`;
  
  // Simulate success (90% of the time)
  const success = Math.random() < 0.9;
  
  if (!success) {
    throw new Error('Payment request failed. Please try again.');
  }
  
  return {
    transactionId,
    success: true,
    message: 'STK push initiated successfully'
  };
};

export const checkTransactionStatus = async (transactionId: string): Promise<{
  status: 'completed' | 'pending' | 'failed';
  resultCode?: string;
  resultDesc?: string;
}> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate transaction status
  const rand = Math.random();
  
  if (rand < 0.7) {
    return {
      status: 'completed',
      resultCode: '0',
      resultDesc: 'The service request is processed successfully.'
    };
  } else if (rand < 0.9) {
    return {
      status: 'pending',
      resultDesc: 'The transaction is being processed'
    };
  } else {
    return {
      status: 'failed',
      resultCode: '1032',
      resultDesc: 'Request cancelled by user'
    };
  }
};