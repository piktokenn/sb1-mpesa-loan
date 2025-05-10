import React from 'react';
import { Printer, Share2, Download } from 'lucide-react';

interface PaymentReceiptProps {
  transactionId: string;
  amount: number;
  phoneNumber: string;
  date: Date;
  merchantName: string;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  transactionId,
  amount,
  phoneNumber,
  date,
  merchantName
}) => {
  const handlePrint = () => {
    window.print();
  };
  
  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 relative overflow-hidden">
      {/* Success Banner */}
      <div className="absolute top-0 left-0 right-0 bg-green-600 h-3" />
      
      <div className="text-center mb-6 pt-3">
        <h2 className="text-2xl font-semibold text-gray-800">Payment Receipt</h2>
        <p className="text-gray-500 text-sm">Transaction completed successfully</p>
      </div>
      
      {/* Receipt Content */}
      <div className="border-t border-b border-dashed border-gray-300 py-4 mb-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount</span>
            <span className="text-2xl font-bold text-gray-800">KES {amount.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Date & Time</span>
            <span className="text-gray-800">{formatDate(date)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Phone Number</span>
            <span className="text-gray-800">{formatPhoneNumber(phoneNumber)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Merchant</span>
            <span className="text-gray-800">{merchantName}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Transaction ID</span>
            <span className="text-gray-800 text-sm">{transactionId}</span>
          </div>
        </div>
      </div>
      
      {/* Status */}
      <div className="flex items-center justify-center mb-6">
        <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          Completed
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={handlePrint}
          className="flex flex-col items-center justify-center py-3 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
        >
          <Printer className="h-5 w-5 text-gray-700 mb-1" />
          <span className="text-xs text-gray-700">Print</span>
        </button>
        
        <button 
          className="flex flex-col items-center justify-center py-3 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
        >
          <Share2 className="h-5 w-5 text-gray-700 mb-1" />
          <span className="text-xs text-gray-700">Share</span>
        </button>
        
        <button 
          className="flex flex-col items-center justify-center py-3 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
        >
          <Download className="h-5 w-5 text-gray-700 mb-1" />
          <span className="text-xs text-gray-700">Download</span>
        </button>
      </div>
      
      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">Thank you for your payment</p>
      </div>
    </div>
  );
};

export default PaymentReceipt;