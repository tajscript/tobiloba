"use client";

import { Instagram, Mail, Twitter } from "lucide-react"
import Link from "next/link"
import React, { useState } from "react";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  receiveNewsletters: string;
}


const page = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    receiveNewsletters: "no",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    // You can send the data to your backend here
  };

  return (
    <div className="bg-primary text-background">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-10 mx-auto max-w-[1563px] py-16 px-5 sm:px-10 lg:p-20">
        <div className="w-full sm:w-1/2 flex flex-col items-center">
          <div className="flex flex-row gap-5 sm:gap-8 mb-5">
            <Link href="/"><Instagram className="w-8 h-8" /></Link>
            <Link href="/"><Twitter className="w-8 h-8" /></Link>
            <Link href="/"><Mail className="w-8 h-8" /></Link>
          </div>

          <p className="text-sm text-center sm:text-base sm:text-start">Looking to discuss a project or inquire about a piece? <br className="hidden sm:block" />
            Fill this, and I will get back to you in within 24 hours.</p>
          <p className="text-center mt-2 text-sm sm:text-base">- Tobi Adetimehin</p>
        </div>

        <div className="w-full sm:w-1/2">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 text-background">

            <div>
              <h3 className="mb-2 hidden lg:block">Name  <span className="text-[#7B7878] text-sm">(required)</span></h3>
            <div className="flex flex-col lg:flex-row gap-4 ">
              <div>
                <label htmlFor="firstName" className="block ">First Name  <span className="text-[#7B7878] text-sm lg:hidden">(required)</span></label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block ">Last Name  <span className="text-[#7B7878] text-sm lg:hidden">(required)</span></label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg focus:outline-none"
                />
              </div>
            </div>
            </div>

            <div>
              <label htmlFor="email" className="block ">Email  <span className="text-[#7B7878] text-sm">(required)</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="message" className="block ">Message  <span className="text-[#7B7878] text-sm">(required)</span></label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full border px-3 py-2 rounded-lg focus:outline-none"
              />
            </div>

            {/* Newsletter Radio Section */}
            <div>
              <p className="">Receive Newsletters <span className="text-[#7B7878] text-sm">(required)</span></p>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="receiveNewsletters"
                    value="yes"
                    checked={formData.receiveNewsletters === "yes"}
                    onChange={handleChange}
                    className="accent-secondary"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="receiveNewsletters"
                    value="no"
                    checked={formData.receiveNewsletters === "no"}
                    onChange={handleChange}
                    className="accent-secondary"
                  />
                  No
                </label>
              </div>
            </div>

            <div className="w-full flex justify-center">
              <button
                type="submit"
                className="bg-transparent border border-secondary text-secondary px-10 py-2 rounded-full transition-all hover:bg-secondary hover:text-primary ease-in-out duration-300"
              >
                Submit
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default page