/**
 * Validates a Kenyan phone number for M-Pesa payments
 * Accepts formats: 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, 2541XXXXXXXX
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid Kenyan phone number
  if (digits.length === 10) {
    // Format: 07XXXXXXXX or 01XXXXXXXX
    return /^(07|01)\d{8}$/.test(digits);
  } else if (digits.length === 12) {
    // Format: 2547XXXXXXXX or 2541XXXXXXXX
    return /^254(7|1)\d{8}$/.test(digits);
  }
  
  return false;
};

/**
 * Formats a phone number to the international format required by M-Pesa API
 * Input: 07XXXXXXXX or 01XXXXXXXX
 * Output: 254XXXXXXXXX
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If it's already in international format, return it
  if (digits.length === 12 && digits.startsWith('254')) {
    return digits;
  }
  
  // Convert local format to international
  if (digits.length === 10 && (digits.startsWith('07') || digits.startsWith('01'))) {
    return `254${digits.substring(1)}`;
  }
  
  // Return original if it doesn't match expected formats
  return digits;
};