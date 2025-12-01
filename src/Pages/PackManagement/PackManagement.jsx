import React, { useState, useEffect } from "react";
import { FaBoxOpen, FaSave, FaRegSadCry } from "react-icons/fa";
import { MdOutlineInventory2 } from "react-icons/md";
import { IoMenu } from "react-icons/io5";
import SideBar from "../../components/SideBar/SideBar";

const PackManagement = () => {
  const [smallPackPrice, setSmallPackPrice] = useState("");
  const [bigPackPrice, setBigPackPrice] = useState("");
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [openNav, setOpenNav] = useState(false);

  // Get vendorId from localStorage
  const vendorId = localStorage.getItem("StoreId");
  const API = import.meta.env.VITE_REACT_APP_API;

  // Fetch pack prices on mount
  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    fetch(`${API}/api/pack-prices/${vendorId}`)
      .then((res) => res.json())
      .then((data) => {
        if (
          data.smallPackPrice !== undefined &&
          data.bigPackPrice !== undefined
        ) {
          setSmallPackPrice(
            data.smallPackPrice === 0 ? "" : data.smallPackPrice
          );
          setBigPackPrice(data.bigPackPrice === 0 ? "" : data.bigPackPrice);
          setPacks([
            { name: "Small Pack", price: data.smallPackPrice },
            { name: "Big Pack", price: data.bigPackPrice },
          ]);
        } else {
          setPacks([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setPacks([]);
        setLoading(false);
      });
  }, [vendorId, API]);

  // Save pack prices
  const handleSave = async () => {
    if (!vendorId) {
      setMessage("Vendor ID not found.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/pack-prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          smallPackPrice: smallPackPrice === "" ? 0 : Number(smallPackPrice),
          bigPackPrice: bigPackPrice === "" ? 0 : Number(bigPackPrice),
        }),
      });
      const data = await res.json();
      if (
        data.smallPackPrice !== undefined &&
        data.bigPackPrice !== undefined
      ) {
        setMessage("Pack prices updated successfully!");
        setPacks([
          { name: "Small Pack", price: data.smallPackPrice },
          { name: "Big Pack", price: data.bigPackPrice },
        ]);
      } else {
        setMessage(data.error || "Failed to update pack prices.");
      }
    } catch (err) {
      setMessage("Error updating pack prices.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[#f5f6fa]">
      <div
        className={`
          fixed top-0 left-0 h-screen z-50 transform transition-transform duration-300
          ${openNav ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 w-[270px] md:w-[240px]
        `}
      >
        <SideBar setOpenNav={setOpenNav} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-4 items-center">
              <button
                className="md:hidden flex bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-white transition-all shadow-sm"
                onClick={() => setOpenNav(true)}
              >
                <IoMenu size={18} className="text-gray-700" />
              </button>
              <div>
                <h1 className="font-extrabold text-2xl text-gray-900 tracking-tight">
                  Pack Price Management
                </h1>
                <p className="text-base text-gray-500 mt-1">
                  Set and view your store's pack prices in a minimal dashboard
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow p-8 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <FaBoxOpen className="text-2xl text-[#222] opacity-60" />
                <h2 className="text-lg font-bold text-gray-800 tracking-tight">
                  Set Pack Prices
                </h2>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700 text-sm">
                    Small Pack Price
                  </label>
                  <input
                    type="number"
                    value={smallPackPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSmallPackPrice(
                        val === "" ? "" : val.replace(/^0+/, "")
                      );
                    }}
                    min={0}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#222] text-base bg-white/60"
                    placeholder="Enter price for Small Pack"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700 text-sm">
                    Big Pack Price
                  </label>
                  <input
                    type="number"
                    value={bigPackPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBigPackPrice(val === "" ? "" : val.replace(/^0+/, ""));
                    }}
                    min={0}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#222] text-base bg-white/60"
                    placeholder="Enter price for Big Pack"
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={loading}
                className="mt-8 w-full flex items-center justify-center gap-2 bg-[#222] text-white font-bold py-3 rounded-xl shadow hover:bg-[#444] transition-all disabled:opacity-60"
              >
                <FaSave className="text-lg" />
                {loading ? "Saving..." : "Save Prices"}
              </button>
              {message && (
                <div className="mt-4 text-center text-green-600 font-semibold animate-fade-in">
                  {message}
                </div>
              )}
            </div>
            <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow p-8 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <MdOutlineInventory2 className="text-xl text-[#222] opacity-60" />
                <h2 className="text-lg font-bold text-gray-800 tracking-tight">
                  Current Pack Prices
                </h2>
              </div>
              {packs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <FaRegSadCry className="text-5xl text-gray-400 mb-2" />
                  <p className="text-gray-500 font-semibold">
                    No packs available
                  </p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {packs.map((pack, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between bg-white/60 rounded-lg px-4 py-3 shadow border border-gray-100"
                    >
                      <span className="font-semibold text-gray-800 text-base flex items-center gap-2">
                        <MdOutlineInventory2 className="text-[#222] opacity-60" />{" "}
                        {pack.name}
                      </span>
                      <span className="text-[#222] font-bold text-base">
                        ₦{pack.price}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackManagement;
