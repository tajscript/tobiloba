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
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [form, setForm] = useState({
    offer: "",
    email: "",
    country: "",
    region: "",
  });

  useEffect(() => {
    setRegionOptions(countryOptions[form.country as keyof typeof countryOptions] || []);
    // Reset region when country changes
    if (form.country && !countryOptions[form.country as keyof typeof countryOptions]?.includes(form.region)) {
      setForm(prev => ({ ...prev, region: "" }));
    }
  }, [form.country, form.region]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.offer || !form.email || !form.country || !form.region) {
      setSubmitMessage("Please fill in all required fields.");
      return;
    }

    if (Number(form.offer) <= 0) {
      setSubmitMessage("Please enter a valid offer amount.");
      return;
    }

    setLoading(true);
    setSubmitMessage("");

    try {
      const response = await fetch('/api/make-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          artTitle,
          artPrice,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage("Offer submitted successfully! We'll get back to you soon.");
        setForm({
          offer: "",
          email: "",
          country: "",
          region: "",
        });
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSubmitMessage("");
        }, 2000);
      } else {
        setSubmitMessage(data.error || "Failed to submit offer. Please try again.");
      }
    } catch (error) {
      setSubmitMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-background rounded-lg p-6 w-[90%] max-w-md relative text-[#7B7878]">
        <button 
          onClick={onClose} 
          disabled={loading}
          className="absolute top-2 right-4 text-xl font-bold disabled:opacity-50"
        >
          ×
        </button>

        <h2 className="text-3xl font-montaga mb-2 uppercase">Make Tobi an <br /> offer</h2>

        <div className="mb-6 text-sm font-gentiumPlus">
          <p className="font-medium">{artTitle}</p>
          <p className="text-sm text-gray-600">Price: ${artPrice.toLocaleString()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="number"
            name="offer"
            placeholder="Your offer amount"
            required
            value={form.offer}
            onChange={handleChange}
            disabled={loading}
            min="1"
            className="w-full border border-[#D2C4C4] bg-background shadow-sm px-3 py-2 rounded focus:outline-none disabled:opacity-50"
          />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            required
            value={form.email}
            onChange={handleChange}
            disabled={loading}
            className="w-full border border-[#D2C4C4] bg-background shadow-sm px-3 py-2 rounded focus:outline-none disabled:opacity-50"
          />
          <select
            name="country"
            required
            value={form.country}
            onChange={handleChange}
            disabled={loading}
            className="w-full border border-[#D2C4C4] bg-background shadow-sm px-3 py-2 rounded focus:outline-none disabled:opacity-50"
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
            disabled={loading}
            className="w-full border border-[#D2C4C4] bg-background shadow-sm px-3 py-2 rounded disabled:opacity-50"
          >
            <option value="">Select Region</option>
            {regionOptions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          {submitMessage && (
            <div className="text-center">
              <p className={`text-sm ${submitMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                {submitMessage}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-background py-2 rounded mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Send Offer"}
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