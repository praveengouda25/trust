/** Shared field validators used by the registration forms. */

export const AADHAAR_RE = /^\d{12}$/;
export const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/;
export const PINCODE_RE = /^\d{6}$/;

export function validateAadhaar(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (!/^\d+$/.test(v)) return "Aadhaar number may contain digits only.";
  if (!AADHAAR_RE.test(v)) return "Aadhaar number must be exactly 12 digits (e.g. 123456789012).";
  return null;
}

export function validatePan(value: string): string | null {
  const v = value.trim().toUpperCase();
  if (!v) return null;
  if (!PAN_RE.test(v))
    return "PAN must be 5 capital letters, 4 digits, then 1 capital letter (e.g. ABCDE1234F).";
  return null;
}

export function validatePincode(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (!PINCODE_RE.test(v)) return "Pincode must be exactly 6 digits.";
  return null;
}

/** Mobile numbers are stored with their dialling code, e.g. +919876543210. */
export function validateMobile(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (v.startsWith("+91")) {
    const digits = v.slice(3).replace(/\D/g, "");
    if (digits.length !== 10) return "Indian mobile numbers must be exactly 10 digits.";
    if (!/^[6-9]/.test(digits)) return "Indian mobile numbers start with 6, 7, 8 or 9.";
    return null;
  }
  const digits = v.replace(/\D/g, "");
  if (digits.length < 7) return "Please enter a valid mobile number.";
  return null;
}
