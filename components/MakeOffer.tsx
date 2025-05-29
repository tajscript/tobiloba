"use client";

import { FC, useState, useEffect } from "react";

type MakeOfferModalProps = {
  isOpen: boolean;
  onClose: () => void;
  artTitle: string;
  artPrice: number;
};

const countryOptions = {
  US: ["California", "New York", "Texas", "Florida", "Illinois"],
  Canada: ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba"],
  UK: ["England", "Scotland", "Wales", "Northern Ireland"],
};

const MakeOfferModal: FC<MakeOfferModalProps> = ({ isOpen, onClose, artTitle, artPrice }) => {
  const [country, setCountry] = useState("");
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [form, setForm] = useState({
    offer: "",
    email: "",
    country: "",
    region: "",
  });

  useEffect(() => {
    setRegionOptions(countryOptions[form.country as keyof typeof countryOptions] || []);
  }, [form.country]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-background rounded-lg p-6 w-[90%] max-w-md relative text-[#7B7878]">
        <button onClick={onClose} className="absolute top-2 right-4 text-xl font-bold">
          ×
        </button>

        <h2 className="text-3xl font-montaga mb-2 uppercase">Make Tobi an <br /> offer</h2>

        <div className="mb-6 text-sm font-gentiumPlus">
          <p className="font-medium">{artTitle}</p>
          <p className="text-sm text-gray-600">Price: ${artPrice.toLocaleString()}</p>
        </div>

        <form className="space-y-5">
          <input
            type="number"
            name="offer"
            placeholder="Your offer amount"
            required
            value={form.offer}
            onChange={handleChange}
            className="w-full border border-[#D2C4C4] bg-background shadow-sm px-3 py-2 rounded focus:outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full border border-[#D2C4C4] bg-background shadow-sm px-3 py-2 rounded focus:outline-none"
          />
          <select
            name="country"
            required
            value={form.country}
            onChange={handleChange}
            className="w-full border border-[#D2C4C4] bg-background shadow-sm px-3 py-2 rounded focus:outline-none"
          >
            <option value="">Select Country</option>
            <option value="US">United States</option>
            <option value="Canada">Canada</option>
            <option value="UK">United Kingdom</option>
          </select>
          <select
            name="region"
            required
            value={form.region}
            onChange={handleChange}
            className="w-full border border-[#D2C4C4] bg-background shadow-sm px-3 py-2 rounded"
          >
            <option value="">Select Region</option>
            {regionOptions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full bg-primary text-background py-2 rounded mt-2"
            onClick={(e) => {
              e.preventDefault();
              // Submit logic here
              alert("Offer submitted!");
              onClose();
            }}
          >
            Send Offer
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4">
          * Applicable delivery costs and taxes may be applied in addition to your offer amount.
        </p>
      </div>
    </div>
  );
};

export default MakeOfferModal;
