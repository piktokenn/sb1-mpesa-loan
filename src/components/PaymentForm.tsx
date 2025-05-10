import React, { useState } from 'react';
import { Phone, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
import { validatePhoneNumber } from '../utils/validators';

interface PaymentFormProps {
  onSubmit: (phoneNumber: string, amount: number) => Promise<void>;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount(false);
  };

  const handleCustomAmountToggle = () => {
    setCustomAmount(true);
    setAmount(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid Safaricom phone number (format: 07XXXXXXXX or 01XXXXXXXX)');
      return;
    }

    // Validate amount
    if (amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(phoneNumber, amount);
    } catch (err) {
      setError('Payment request failed. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedPhoneNumber = (number: string) => {
    // Format phone number as user types
    if (!number) return '';
    
    // Remove non-digit characters
    const digits = number.replace(/\D/g, '');
    
    // Format as 07XX XXX XXX or 01XX XXX XXX
    if (digits.length <= 4) {
      return digits;
    } else if (digits.length <= 7) {
      return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    } else {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Pay with M-Pesa</h2>
        
        {/* Phone Number Input */}
        <div className="mb-6">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="phone"
              value={formattedPhoneNumber(phoneNumber)}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\s/g, ''))}
              className="pl-10 block w-full rounded-md border-gray-300 bg-gray-50 py-3 px-4 focus:border-green-500 focus:ring-green-500 transition-all duration-200"
              placeholder="07XX XXX XXX"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Enter the phone number to receive the M-Pesa prompt</p>
        </div>

        {/* Amount Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (KES)
          </label>
          
          {/* Predefined Amounts */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[100, 500, 1000].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleAmountSelect(value)}
                className={`py-2 px-4 rounded-md focus:outline-none ${
                  amount === value && !customAmount 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } transition-colors duration-200`}
              >
                KES {value.toLocaleString()}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[1500, 2000, 5000].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleAmountSelect(value)}
                className={`py-2 px-4 rounded-md focus:outline-none ${
                  amount === value && !customAmount 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } transition-colors duration-200`}
              >
                KES {value.toLocaleString()}
              </button>
            ))}
          </div>
          
          {/* Custom Amount */}
          <div>
            <button
              type="button"
              onClick={handleCustomAmountToggle}
              className={`py-2 px-4 rounded-md focus:outline-none mb-2 w-full text-left ${
                customAmount 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } transition-colors duration-200`}
            >
              Custom Amount
            </button>
            
            {customAmount && (
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">KES</span>
                </div>
                <input
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="pl-14 block w-full rounded-md border-gray-300 bg-gray-50 py-3 px-4 focus:border-green-500 focus:ring-green-500 transition-all duration-200"
                  placeholder="Enter amount"
                  min="1"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex justify-center items-center w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md transition-all duration-200 disabled:opacity-70"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <CreditCard className="h-5 w-5 mr-2" />
          )}
          {isSubmitting ? 'Processing...' : 'Pay KES ' + amount.toLocaleString()}
          {!isSubmitting && <ChevronRight className="h-5 w-5 ml-2" />}
        </button>
      </form>
      
      <div className="text-center text-xs text-gray-500">
        <p>Secure payment powered by M-Pesa</p>
        <p className="mt-1">You will receive an STK push prompt on your phone</p>
      </div>
    </div>
  );
};

export default PaymentForm;