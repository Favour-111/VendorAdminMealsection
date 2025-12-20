import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegImage, FaTrash } from "react-icons/fa6";
import { MdCloudUpload } from "react-icons/md";
import axios from "axios";
import { useEffect } from "react";

const SignUp = () => {
  const navigate = useNavigate();

  const [universities, setUniversities] = useState([]);
  const [login, setLogin] = useState({
    email: "",
    password: "",
    Store: "",
    School: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState("");

  const handleFetch = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/universities`
      );
      if (data) {
        setUniversities(data.universities);
      } else {
        setMessage("Error fetching universities. Please reload the page");
      }
    } catch (error) {
      console.log(error);
      setMessage("Error fetching universities");
    }
  };
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);

  const handleInput = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setLogin({ ...login, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64("");
  };

  const submitForm = async () => {
    // Basic validation
    if (!login.email || !login.password || !login.Store || !login.School) {
      setMessage("Please fill all fields.");
      return;
    }

    if (!imageBase64) {
      setMessage("Please upload a store image.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // POST request to backend signup route
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API}/api/vendors/signup`,
        {
          storeName: login.Store,
          university: login.School,
          email: login.email,
          password: login.password,
          image: imageBase64,
        }
      );
      if (response) {
        setMessage(response.data.message || "Signup successful!");
        setLogin({ email: "", password: "", Store: "", School: "" });
        setImagePreview(null);
        setImageBase64("");
        setShowValidationModal(true);
        console.log(response);
      }
      // Modal state
    } catch (error) {
      console.error(error);
      if (error.response) {
        setMessage(error.response.data.message || "Something went wrong.");
      } else {
        setMessage("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    handleFetch();
  }, []);
  return (
    <div className="min-h-screen md:flex flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
      <div className="flex flex-col items-center justify-center  w-[100%] md:w-[50%] bg-white md:rounded-l-[40px]  relative  shadow-sm overflow-y-auto py-8">
        <div className="w-full max-w-md px-8">
          <div className="text-center mb-8">
            <img
              src="https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true"
              alt=""
              className="w-[160px] mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-800">
              Create Vendor Account
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Fill in your details to get started
            </p>
          </div>

          <div className="space-y-4">
            {/* Store Image Upload */}
            <div className="w-full">
              <label className="font-semibold text-sm text-gray-700 mb-2 block">
                Store Image
              </label>
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group">
                  <div className="flex flex-col items-center justify-center py-6">
                    <MdCloudUpload className="w-12 h-12 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    <p className="mb-1 text-sm text-gray-600 font-medium">
                      <span className="text-orange-500">Click to upload</span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG or JPEG (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              ) : (
                <div className="relative w-full h-40 border-2 border-gray-300 rounded-xl overflow-hidden group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={removeImage}
                      className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full">
              <label className="font-semibold text-sm text-gray-700 mb-2 block">
                Store Name
              </label>
              <input
                name="Store"
                onChange={handleInput}
                value={login.Store}
                type="text"
                placeholder="Enter store name"
                className="border border-gray-300 px-4 py-3 rounded-xl w-full placeholder-gray-400 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>

            <div className="w-full">
              <label className="font-semibold text-sm text-gray-700 mb-2 block">
                Email
              </label>
              <input
                name="email"
                onChange={handleInput}
                value={login.email}
                type="email"
                placeholder="your.email@example.com"
                className="border border-gray-300 px-4 py-3 rounded-xl w-full placeholder-gray-400 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>

            <div className="w-full">
              <label className="font-semibold text-sm text-gray-700 mb-2 block">
                Password
              </label>
              <input
                name="password"
                type="password"
                onChange={handleInput}
                value={login.password}
                placeholder="Create a secure password"
                className="border border-gray-300 px-4 py-3 rounded-xl w-full placeholder-gray-400 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>

            <div className="w-full">
              <label className="font-semibold text-sm text-gray-700 mb-2 block">
                University
              </label>
              <select
                name="School"
                onChange={handleInput}
                value={login.School}
                className="border border-gray-300 px-4 py-3 rounded-xl w-full text-sm text-gray-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all bg-white"
              >
                <option value="" disabled>
                  Select your university
                </option>
                {universities.map((item, idx) => (
                  <option key={idx} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-gray-600 text-xs bg-orange-50 border border-orange-200 rounded-lg p-3">
              <span className="font-semibold">Note:</span> By clicking Sign Up,
              you agree with our{" "}
              <span className="font-semibold text-orange-600 underline cursor-pointer">
                terms and conditions
              </span>
              .
            </div>

            {message && (
              <div
                className={`text-sm p-3 rounded-lg ${
                  message.toLowerCase().includes("success")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <button
              onClick={submitForm}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>

            <div className="text-center text-sm text-gray-600 pt-2">
              Already have an account?{" "}
              <Link
                to="/"
                className="text-orange-600 font-semibold hover:underline"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-fadeInUp">
            <div className="bg-orange-100 rounded-full p-4 mb-4 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-orange-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Account Under Review
            </h2>
            <p className="text-gray-600 text-center mb-4">
              Thank you for signing up! Your account is being reviewed for
              validation. Please come back in{" "}
              <span className="font-semibold text-orange-600">1-24 hours</span>{" "}
              after we verify your details.
            </p>
            <button
              onClick={() => setShowValidationModal(false)}
              className="mt-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold shadow hover:opacity-90 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
