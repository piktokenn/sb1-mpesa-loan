import React from 'react';
import { CheckCircle, XCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export type PaymentStatusType = 'pending' | 'success' | 'failed' | 'timeout';

interface PaymentStatusProps {
  status: PaymentStatusType;
  transactionId?: string;
  amount?: number;
  phoneNumber?: string;
  onRetry?: () => void;
  onDone?: () => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ 
  status, 
  transactionId,
  amount,
  phoneNumber,
  onRetry,
  onDone
}) => {
  const statusConfig = {
    pending: {
      title: 'Payment in Progress',
      description: 'Please check your phone and enter your M-Pesa PIN to complete the payment.',
      icon: <Loader2 className="h-16 w-16 text-yellow-500 animate-spin" />,
      color: 'bg-yellow-50 border-yellow-200',
      action: null
    },
    success: {
      title: 'Payment Successful!',
      description: 'Your payment has been processed successfully.',
      icon: <CheckCircle className="h-16 w-16 text-green-500" />,
      color: 'bg-green-50 border-green-200',
      action: 'Done'
    },
    failed: {
      title: 'Payment Failed',
      description: 'We couldn\'t process your payment. Please try again.',
      icon: <XCircle className="h-16 w-16 text-red-500" />,
      color: 'bg-red-50 border-red-200',
      action: 'Retry'
    },
    timeout: {
      title: 'Payment Timeout',
      description: 'The payment request has timed out. Please try again.',
      icon: <AlertCircle className="h-16 w-16 text-orange-500" />,
      color: 'bg-orange-50 border-orange-200',
      action: 'Retry'
    }
  };

  const config = statusConfig[status];
  
  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  return (
    <div className={`w-full max-w-md mx-auto ${config.color} border rounded-xl p-6 shadow-md`}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">
          {config.icon}
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{config.title}</h2>
        <p className="text-gray-600 mb-6">{config.description}</p>
        
        {/* Transaction Details */}
        {(amount || phoneNumber || transactionId) && (
          <div className="w-full border-t border-dashed border-gray-300 pt-4 mb-6">
            <div className="space-y-2 text-left">
              {amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">KES {amount.toLocaleString()}</span>
                </div>
              )}
              
              {phoneNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone Number:</span>
                  <span className="font-medium">{formatPhoneNumber(phoneNumber)}</span>
                </div>
              )}
              
              {transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium text-sm">{transactionId}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Action Button */}
        {config.action && (
          <button
            onClick={config.action === 'Retry' ? onRetry : onDone}
            className={`flex items-center justify-center w-full py-3 px-4 rounded-md transition-all duration-200 ${
              config.action === 'Retry' 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {config.action}
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;