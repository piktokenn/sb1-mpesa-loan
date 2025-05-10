import React, { useState, useEffect } from 'react';
import PaymentForm from '../components/PaymentForm';
import PaymentStatus, { PaymentStatusType } from '../components/PaymentStatus';
import PaymentReceipt from '../components/PaymentReceipt';
import { initiateSTKPush, checkTransactionStatus } from '../services/mpesaService';
import { formatPhoneNumber } from '../utils/validators';
import { ArrowLeft } from 'lucide-react';

const PaymentPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'form' | 'status' | 'receipt'>('form');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType>('pending');
  const [transactionId, setTransactionId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  
  const handleSubmitPayment = async (phone: string, paymentAmount: number) => {
    try {
      setPhoneNumber(phone);
      setAmount(paymentAmount);
      
      // Initiate payment
      const response = await initiateSTKPush({
        phoneNumber: formatPhoneNumber(phone),
        amount: paymentAmount,
        description: 'Product or service payment'
      });
      
      setTransactionId(response.transactionId);
      setCurrentStep('status');
      setPaymentStatus('pending');
      
      // Start polling for payment status
      pollPaymentStatus(response.transactionId);
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setPaymentStatus('failed');
      setCurrentStep('status');
    }
  };
  
  const pollPaymentStatus = async (txId: string) => {
    // Set timeout to stop polling after 2 minutes
    const timeoutId = setTimeout(() => {
      setPaymentStatus('timeout');
    }, 120000);
    
    let attempts = 0;
    const maxAttempts = 20;
    
    const checkStatus = async () => {
      try {
        attempts++;
        const statusResponse = await checkTransactionStatus(txId);
        
        if (statusResponse.status === 'completed') {
          clearTimeout(timeoutId);
          setPaymentStatus('success');
          setPaymentDate(new Date());
          // Wait a moment before showing the receipt
          setTimeout(() => {
            setCurrentStep('receipt');
          }, 2000);
          return;
        } else if (statusResponse.status === 'failed') {
          clearTimeout(timeoutId);
          setPaymentStatus('failed');
          return;
        }
        
        // If still pending and not max attempts, check again
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 3000);
        } else {
          clearTimeout(timeoutId);
          setPaymentStatus('timeout');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        clearTimeout(timeoutId);
        setPaymentStatus('failed');
      }
    };
    
    // Start checking
    setTimeout(checkStatus, 5000);
  };
  
  const handleRetry = () => {
    setCurrentStep('form');
    setPaymentStatus('pending');
  };
  
  const handleDone = () => {
    setCurrentStep('receipt');
  };
  
  const handleNewPayment = () => {
    setCurrentStep('form');
    setPaymentStatus('pending');
    setTransactionId('');
    setPhoneNumber('');
    setAmount(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-md mx-auto">
        {/* Header with steps */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
            {currentStep === 'form' ? 'Pay with M-Pesa' : 
             currentStep === 'status' ? 'Payment Status' : 
             'Payment Complete'}
          </h1>
          
          <div className="flex items-center justify-between">
            <div 
              className={`flex flex-col items-center ${currentStep === 'form' ? 'text-green-600' : 'text-gray-400'}`}
            >
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                currentStep === 'form' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>1</div>
              <span className="text-xs mt-1">Details</span>
            </div>
            
            <div className={`flex-1 h-1 mx-2 ${
              currentStep !== 'form' ? 'bg-green-600' : 'bg-gray-200'
            }`} />
            
            <div 
              className={`flex flex-col items-center ${
                currentStep === 'status' ? 'text-green-600' : 
                currentStep === 'receipt' ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                currentStep === 'form' ? 'bg-gray-200 text-gray-500' : 
                'bg-green-600 text-white'
              }`}>2</div>
              <span className="text-xs mt-1">Confirm</span>
            </div>
            
            <div className={`flex-1 h-1 mx-2 ${
              currentStep === 'receipt' ? 'bg-green-600' : 'bg-gray-200'
            }`} />
            
            <div 
              className={`flex flex-col items-center ${currentStep === 'receipt' ? 'text-green-600' : 'text-gray-400'}`}
            >
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                currentStep === 'receipt' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>3</div>
              <span className="text-xs mt-1">Receipt</span>
            </div>
          </div>
        </div>
        
        {/* Back button */}
        {currentStep !== 'form' && paymentStatus !== 'pending' && (
          <button 
            onClick={handleNewPayment} 
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            New Payment
          </button>
        )}
        
        {/* Current step content */}
        {currentStep === 'form' && (
          <PaymentForm onSubmit={handleSubmitPayment} />
        )}
        
        {currentStep === 'status' && (
          <PaymentStatus 
            status={paymentStatus} 
            transactionId={transactionId}
            amount={amount}
            phoneNumber={phoneNumber}
            onRetry={handleRetry}
            onDone={handleDone}
          />
        )}
        
        {currentStep === 'receipt' && (
          <PaymentReceipt 
            transactionId={transactionId}
            amount={amount}
            phoneNumber={phoneNumber}
            date={paymentDate}
            merchantName="Your Business Name"
          />
        )}
      </div>
    </div>
  );
};

export default PaymentPage;