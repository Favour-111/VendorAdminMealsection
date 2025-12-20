import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API
        }/api/vendors/reset-password/${token}`,
        { newPassword }
      );
      setMessage(res.data.message || "Password reset successful.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error resetting password.");
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
            Set New Password
          </h2>
          <p className="text-xs text-gray-500 text-center">
            Enter your new password below to reset your vendor account.
          </p>
        </div>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full p-3 border border-[var(--defaultLight)] rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--default)] text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-[var(--default)] to-[#c91a1a] shadow hover:scale-[1.02] transition"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium ${
              message.toLowerCase().includes("success") ||
              message.toLowerCase().includes("reset")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;
