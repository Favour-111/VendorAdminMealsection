import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { messaging, getToken } from "../../config/firebase";

const Login = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Request notification permission and get FCM token
  const requestNotificationPermission = async () => {
    try {
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const isStandalone =
        window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches;
      if (isIOS && !isStandalone) {
        console.log(
          "iOS Safari requires installing the app to Home Screen for push notifications."
        );
        // Continue login without notifications
        return null;
      }
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        // Ensure a service worker is ready (required especially on iOS)
        const registration = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, {
          vapidKey:
            "BGRrHITgNaK202cuNVMwzxzc_9J8IJloWbYwC0YE2CMQvuYCYJfb-YmwQPueqaZhf8ElJqauT27Uw0z11oHcjMA",
          serviceWorkerRegistration: registration,
        });

        if (token) {
          console.log("FCM Token:", token);
          return token;
        }
      } else {
        console.log("Notification permission denied");
      }
    } catch (error) {
      console.error("Error getting FCM token:", error);
    }
    return null;
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setLogin({ ...login, [name]: value });
  };

  const submitForm = async () => {
    if (!login.email || !login.password) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // Get FCM token for push notifications
      const fcmToken = await requestNotificationPermission();

      // POST request to backend login route
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API}/api/vendors/login`,
        {
          email: login.email,
          password: login.password,
          fcmToken: fcmToken, // Send FCM token to backend
        }
      );

      // Save token and vendor ID to localStorage
      if (response) {
        localStorage.setItem("StoreId", response.data.vendor.id);
        localStorage.setItem("token", response.data.token);
      }

      setMessage("Login successful!");
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error(error);
      if (error.response) {
        setMessage(error.response.data.message || "Invalid credentials.");
      } else {
        setMessage("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Right: Login Card */}
      <div className="md:w-1/2 w-full flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 flex flex-col gap-6 animate-fadeInUp">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <img
              src="https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true"
              alt="logo"
              className="w-32 h-auto rounded-xl shadow"
            />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Vendor Login
          </h2>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitForm();
            }}
            autoComplete="off"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email or Phone
              </label>
              <input
                name="email"
                value={login.email}
                onChange={handleInput}
                type="text"
                placeholder="Enter your email or phone number"
                className="border border-gray-300 focus:border-[var(--default)] focus:ring-2 focus:ring-[var(--default)]/20 px-4 py-2 rounded-xl w-full placeholder-gray-400 text-[15px] outline-none transition-all"
                autoComplete="username"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                name="password"
                value={login.password}
                onChange={handleInput}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="border border-gray-300 focus:border-[var(--default)] focus:ring-2 focus:ring-[var(--default)]/20 px-4 py-2 rounded-xl w-full placeholder-gray-400 text-[15px] outline-none transition-all pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-400 hover:text-[var(--default)] focus:outline-none"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <label className="flex items-center gap-2 select-none">
                <input type="checkbox" className="accent-[var(--default)]" />
                <span className="text-gray-600">Remember Me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-[var(--default)] hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            {message && (
              <div
                className={`text-[14px] mt-1 text-center ${
                  message.toLowerCase().includes("success")
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-[var(--default)] hover:bg-orange-700 transition text-white text-base font-semibold py-2.5 rounded-xl shadow-md disabled:opacity-60"
            >
              {loading ? "Logging In..." : "Login"}
            </button>
          </form>
          <div className="text-center text-sm font-medium mt-2">
            Don’t have an account?{" "}
            <Link
              to="/sign-up"
              className="text-[var(--default)] underline font-bold cursor-pointer"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
