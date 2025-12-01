import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API}/api/vendors/forgot-password`,
        { email }
      );
      setMessage(res.data.message || "Check your email for the reset link.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--defaultLight)] to-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 p-8 rounded-2xl shadow-xl w-full max-w-md border border-[var(--defaultLight)]"
      >
        <div className="flex flex-col items-center mb-6">
          <img
            src="https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true"
            alt="MealSection Logo"
            className="w-20 mb-2 rounded-full shadow"
          />
          <h2 className="text-2xl font-extrabold mb-1 text-center text-[var(--default)]">
            Vendor Password Reset
          </h2>
          <p className="text-xs text-gray-500 text-center">
            Enter your vendor email to receive a password reset link.
          </p>
        </div>
        <input
          type="email"
          placeholder="Vendor email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-[var(--defaultLight)] rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--default)] text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-[var(--default)] to-[#c91a1a] shadow hover:scale-[1.02] transition"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        {message && (
          <p className="mt-4 text-center text-sm text-[var(--default)] font-medium">
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;
