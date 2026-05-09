/**
 * Text Formatting & Validation Helpers
 * Centralized formatting patterns used by multiple controllers
 */

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[a-zA-Z\s.'-]+$/;
const PIN_PATTERN = /^\d{6}$/;
const PAN_PATTERN = /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/;
const UPI_PATTERN = /^[A-Za-z0-9._-]{2,256}@[A-Za-z]{2,64}$/;

export const isValidIsoDate = (dateString) => {
  return ISO_DATE_PATTERN.test(dateString);
};

export const parseDisplayDate = (text) => {
  if (!text) return "";
  const trimmed = text.trim();
  if (!trimmed) return "";

  const isoMatch = ISO_DATE_PATTERN.exec(trimmed);
  if (isoMatch) return isoMatch[0];

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return null;

  const year = parsed.getFullYear();
  const month = (parsed.getMonth() + 1).toString().padStart(2, "0");
  const day = parsed.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateForDisplay = (isoValue) => {
  if (!isoValue) return "";

  const match = ISO_DATE_PATTERN.exec(isoValue);
  if (!match) return isoValue;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (isNaN(date.getTime())) return isoValue;

  try {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch (error) {
    return isoValue;
  }
};

export const isValidEmail = (email) => {
  return EMAIL_PATTERN.test(email);
};

export const isValidName = (name) => {
  return NAME_PATTERN.test(name);
};

export const isValidPin = (pin) => {
  return PIN_PATTERN.test(pin.replace(/\D/g, ""));
};

export const isValidPan = (pan) => {
  return PAN_PATTERN.test(String(pan || "").trim());
};

export const isValidUpi = (upiId) => {
  return UPI_PATTERN.test(String(upiId || "").trim());
};

export const extractDigits = (value, maxLength = null) => {
  const digits = (value || "").replace(/\D+/g, "");
  return maxLength ? digits.slice(0, maxLength) : digits;
};

export const formatMobileNumber = (digits, countryCode = "+91") => {
  return digits ? `${countryCode} ${digits}` : "";
};

export const sanitizeField = (value, rule) => {
  const text = String(value || "").trim();

  switch (rule) {
    case "name":
      return text.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
    case "email":
      return text.replace(/[<>]/g, "").toLowerCase();
    case "text":
      return text.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
    default:
      return text;
  }
};
