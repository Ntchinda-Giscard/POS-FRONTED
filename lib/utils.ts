import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency interface
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  numericCode: number;
  countries: string[];
}

// Currency data
export const currencies: Currency[] = [
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    decimals: 2,
    numericCode: 840,
    countries: ["United States", "Ecuador", "El Salvador", "East Timor"],
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    decimals: 2,
    numericCode: 978,
    countries: ["Germany", "France", "Italy", "Spain", "Netherlands"],
  },
  {
    code: "GBP",
    name: "British Pound Sterling",
    symbol: "£",
    decimals: 2,
    numericCode: 826,
    countries: ["United Kingdom"],
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    decimals: 0,
    numericCode: 392,
    countries: ["Japan"],
  },
  {
    code: "CHF",
    name: "Swiss Franc",
    symbol: "CHF",
    decimals: 2,
    numericCode: 756,
    countries: ["Switzerland", "Liechtenstein"],
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
    decimals: 2,
    numericCode: 124,
    countries: ["Canada"],
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    decimals: 2,
    numericCode: 36,
    countries: ["Australia", "Kiribati", "Nauru", "Tuvalu"],
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
    decimals: 2,
    numericCode: 156,
    countries: ["China"],
  },
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    decimals: 2,
    numericCode: 356,
    countries: ["India"],
  },
  {
    code: "BRL",
    name: "Brazilian Real",
    symbol: "R$",
    decimals: 2,
    numericCode: 986,
    countries: ["Brazil"],
  },
  {
    code: "KRW",
    name: "South Korean Won",
    symbol: "₩",
    decimals: 0,
    numericCode: 410,
    countries: ["South Korea"],
  },
  {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    decimals: 2,
    numericCode: 702,
    countries: ["Singapore"],
  },
  {
    code: "HKD",
    name: "Hong Kong Dollar",
    symbol: "HK$",
    decimals: 2,
    numericCode: 344,
    countries: ["Hong Kong"],
  },
  {
    code: "MXN",
    name: "Mexican Peso",
    symbol: "$",
    decimals: 2,
    numericCode: 484,
    countries: ["Mexico"],
  },
  {
    code: "NOK",
    name: "Norwegian Krone",
    symbol: "kr",
    decimals: 2,
    numericCode: 578,
    countries: ["Norway"],
  },
  {
    code: "SEK",
    name: "Swedish Krona",
    symbol: "kr",
    decimals: 2,
    numericCode: 752,
    countries: ["Sweden"],
  },
  {
    code: "DKK",
    name: "Danish Krone",
    symbol: "kr",
    decimals: 2,
    numericCode: 208,
    countries: ["Denmark", "Faroe Islands", "Greenland"],
  },
  {
    code: "PLN",
    name: "Polish Złoty",
    symbol: "zł",
    decimals: 2,
    numericCode: 985,
    countries: ["Poland"],
  },
  {
    code: "CZK",
    name: "Czech Koruna",
    symbol: "Kč",
    decimals: 2,
    numericCode: 203,
    countries: ["Czech Republic"],
  },
  {
    code: "HUF",
    name: "Hungarian Forint",
    symbol: "Ft",
    decimals: 2,
    numericCode: 348,
    countries: ["Hungary"],
  },
  {
    code: "RUB",
    name: "Russian Ruble",
    symbol: "₽",
    decimals: 2,
    numericCode: 643,
    countries: ["Russia"],
  },
  {
    code: "TRY",
    name: "Turkish Lira",
    symbol: "₺",
    decimals: 2,
    numericCode: 949,
    countries: ["Turkey"],
  },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    decimals: 2,
    numericCode: 710,
    countries: ["South Africa", "Lesotho", "Namibia"],
  },
  {
    code: "AED",
    name: "UAE Dirham",
    symbol: "د.إ",
    decimals: 2,
    numericCode: 784,
    countries: ["United Arab Emirates"],
  },
  {
    code: "SAR",
    name: "Saudi Riyal",
    symbol: "﷼",
    decimals: 2,
    numericCode: 682,
    countries: ["Saudi Arabia"],
  },
  {
    code: "EGP",
    name: "Egyptian Pound",
    symbol: "£",
    decimals: 2,
    numericCode: 818,
    countries: ["Egypt"],
  },
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    decimals: 2,
    numericCode: 566,
    countries: ["Nigeria"],
  },
  {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh",
    decimals: 2,
    numericCode: 404,
    countries: ["Kenya"],
  },
  {
    code: "GHS",
    name: "Ghanaian Cedi",
    symbol: "₵",
    decimals: 2,
    numericCode: 936,
    countries: ["Ghana"],
  },
  {
    code: "XAF",
    name: "Central African CFA Franc",
    symbol: "FCFA",
    decimals: 0,
    numericCode: 950,
    countries: [
      "Cameroon",
      "Central African Republic",
      "Chad",
      "Republic of the Congo",
      "Equatorial Guinea",
      "Gabon",
    ],
  },
];

// Utility functions
export const getCurrencyByCode = (code: string): Currency | undefined => {
  const currency = currencies.find((currency) => currency.code === code);
  return currency;
};

export const getCurrenciesByCountry = (country: string): Currency[] => {
  return currencies.filter((currency) =>
    currency.countries.some((c) =>
      c.toLowerCase().includes(country.toLowerCase())
    )
  );
};

export const formatCurrency = (
  amount: number,
  currencyCode: string
): string => {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return `${amount}`;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(amount);
};

// Currency codes enum for better type safety
export enum CurrencyCode {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  CHF = "CHF",
  CAD = "CAD",
  AUD = "AUD",
  CNY = "CNY",
  INR = "INR",
  BRL = "BRL",
  KRW = "KRW",
  SGD = "SGD",
  HKD = "HKD",
  MXN = "MXN",
  NOK = "NOK",
  SEK = "SEK",
  DKK = "DKK",
  PLN = "PLN",
  CZK = "CZK",
  HUF = "HUF",
  RUB = "RUB",
  TRY = "TRY",
  ZAR = "ZAR",
  AED = "AED",
  SAR = "SAR",
  EGP = "EGP",
  NGN = "NGN",
  KES = "KES",
  GHS = "GHS",
  XAF = "XAF",
}

// Export default
export default currencies;
