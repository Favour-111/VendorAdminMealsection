import React, { useState, useEffect, useMemo } from "react";
import SideBar from "../../components/SideBar/SideBar";
import {
  IoBagCheck,
  IoCheckmark,
  IoCheckmarkDone,
  IoClose,
  IoMenu,
  IoPhoneLandscapeOutline,
} from "react-icons/io5";
import { SlBell } from "react-icons/sl";
import { CiShoppingTag, CiUser } from "react-icons/ci";
import { HiOutlineBuildingStorefront } from "react-icons/hi2";
import { BsWallet } from "react-icons/bs";
import toast from "react-hot-toast";
import axios from "axios";
import "./Home.css";
const Home = () => {
  const [openNav, setOpenNav] = useState(false);
  const [allOrder, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vendor, setVendor] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [updatingActive, setUpdatingActive] = useState(false);
  const StoreId = localStorage.getItem("StoreId");

  const FetchStore = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_REACT_APP_API}/api/vendors/all`
    );
    if (res) {
      setVendor(res.data);
    } else {
      toast.error("error fetching Vendors");
    }
  };
  const filterVendor = vendor?.find((item) => item._id === StoreId);

  const toggleActive = async () => {
    if (!filterVendor?._id) return;
    try {
      setUpdatingActive(true);
      const API = import.meta.env.VITE_REACT_APP_API;
      const goingActive = String(filterVendor?.Active).toLowerCase() !== "true";
      const url = goingActive
        ? `${API}/api/vendors/${filterVendor._id}/activate`
        : `${API}/api/vendors/${filterVendor._id}/deactivate`;
      await axios.patch(url);
      setVendor((prev) =>
        prev.map((v) =>
          v._id === filterVendor._id
            ? { ...v, Active: goingActive ? "true" : "false" }
            : v
        )
      );
      toast.success(
        goingActive ? "Store is now online" : "Store set to offline"
      );
    } catch (e) {
      console.error(e);
      toast.error("Failed to update store status");
    } finally {
      setUpdatingActive(false);
    }
  };
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/users/orders`
      );

      if (response && response.data.orders) {
        console.log(response.data.orders);

        setAllOrders(response.data.orders);
      } else {
        toast.error("Error fetching orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Something went wrong fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    FetchStore();
  }, []);

  const filteredOrders = allOrder
    .map((order) => {
      // Make sure order.packs exists and is an array before filtering
      const vendorPacks = Array.isArray(order.packs)
        ? order.packs.filter((pack) => pack.vendorId === StoreId)
        : [];

      if (vendorPacks.length > 0) {
        return {
          ...order,
          packs: vendorPacks,
        };
      }

      return null;
    })
    .filter(Boolean);

  // Derived counts
  const pendingCount = useMemo(
    () => filteredOrders.filter((o) => o.currentStatus === "Pending").length,
    [filteredOrders]
  );
  const ongoingCount = useMemo(
    () => filteredOrders.filter((o) => o.currentStatus === "Processing").length,
    [filteredOrders]
  );
  const completedCount = useMemo(
    () => filteredOrders.filter((o) => o.currentStatus === "Delivered").length,
    [filteredOrders]
  );
  const recentOrders = useMemo(
    () => filteredOrders.slice().reverse().slice(0, 6),
    [filteredOrders]
  );
  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 justify-between">
      {openNav && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpenNav(false)}
        />
      )}

      {/* Sidebar: slides in on mobile, always visible on md+ */}
      <div
        className={`
          fixed top-0 left-0 h-screen z-50 transform transition-transform duration-300
          ${openNav ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 w-[270px] md:w-[240px]
        `}
      >
        <SideBar setOpenNav={setOpenNav} />
      </div>

      <div className="flex-1 md:ml-[240px] w-full min-h-screen overflow-y-auto">
        <div className="md:p-6 px-5 mt-3 pb-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4 items-center">
              <button
                className="md:hidden flex bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-white transition-all shadow-sm"
                onClick={() => setOpenNav(true)}
              >
                <IoMenu size={18} className="text-gray-700" />
              </button>
              <div>
                <h1 className="font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Store Overview
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Track orders and wallet performance
                </p>
              </div>
            </div>
          </div>
          {/* Store identity */}
          <div className="flex gap-3 mt-3 p-4 items-center bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm">
            <div className="rounded-xl overflow-hidden w-14 h-14 bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center border border-purple-100 shadow-sm">
              {filterVendor?.image ? (
                <img
                  src={filterVendor.image}
                  alt={filterVendor.storeName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <HiOutlineBuildingStorefront
                  className="text-purple-400"
                  size={24}
                />
              )}
            </div>
            <div>
              <h1 className="font-semibold text-[15px] text-gray-900">
                {filterVendor?.storeName}
              </h1>
              {String(filterVendor?.Active).toLowerCase() === "true" ? (
                <div className="text-green-600 flex items-center gap-1 bg-green-50 w-fit py-1 px-2 text-[11px] rounded-full border border-green-200">
                  Online
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                </div>
              ) : (
                <div className="text-gray-600 flex items-center gap-1 bg-gray-50 w-fit py-1 px-2 text-[11px] rounded-full border border-gray-200">
                  Offline
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                </div>
              )}
            </div>

            <div className="ml-auto">
              <button
                onClick={toggleActive}
                disabled={updatingActive}
                className={`text-xs font-medium px-3 py-2 rounded-xl border transition-all shadow-sm flex items-center gap-2 ${
                  String(filterVendor?.Active).toLowerCase() === "true"
                    ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                    : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {updatingActive ? (
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                ) : null}
                {String(filterVendor?.Active).toLowerCase() === "true"
                  ? "Go Offline"
                  : "Go Online"}
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <CiShoppingTag className="text-white/90" size={18} />
                  <p className="text-xs font-medium text-white/90">Pending</p>
                </div>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <IoBagCheck className="text-white/90" size={18} />
                  <p className="text-xs font-medium text-white/90">Ongoing</p>
                </div>
                <p className="text-2xl font-bold">{ongoingCount}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <IoCheckmarkDone className="text-white/90" size={18} />
                  <p className="text-xs font-medium text-white/90">Completed</p>
                </div>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <BsWallet className="text-white/90" size={18} />
                  <p className="text-xs font-medium text-white/90">Wallet</p>
                </div>
                <p className="text-2xl font-bold">
                  ₦{filterVendor?.availableBal?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-gray-900">
                Recent Orders
              </h2>
            </div>
            <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 animate-pulse"
                  />
                ))
              ) : recentOrders.length > 0 ? (
                recentOrders.map((o) => (
                  <div
                    key={o._id}
                    onClick={() => setSelectedItem(o)}
                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-800">
                        #{o._id.slice(-6)}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          o.currentStatus === "Delivered"
                            ? "bg-emerald-50 text-emerald-600"
                            : o.currentStatus === "Processing"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {o.currentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      📦 {o.packs?.length || 0} pack(s)
                    </p>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-sm text-gray-500">
                  No recent orders.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order details modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <IoClose
                className="text-gray-500 group-hover:text-gray-700"
                size={20}
              />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Order Details
              </h2>
              <p className="text-sm text-gray-500">
                Order #{selectedItem._id.slice(0, 8)}
              </p>
            </div>

            <div className="space-y-4">
              {selectedItem?.packs?.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100"
                >
                  <h3 className="text-sm font-bold text-gray-900 mb-2">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-white rounded-lg px-3 py-1.5 font-medium text-gray-600 border border-gray-200">
                      {p.vendorName}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Items
                    </p>
                    {p.items?.map((it, i2) => (
                      <div
                        key={i2}
                        className="flex justify-between items-center text-xs text-gray-700 bg-white/60 px-3 py-2 rounded-lg"
                      >
                        <div className="flex flex-col">
                          <span>{it.name}</span>
                          <span className="text-xs text-gray-600 font-medium">
                            {it.price !== undefined
                              ? `₦${Number(it.price).toLocaleString()}`
                              : "No price"}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          ×{it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Accept/Decline for Pending Orders */}
            {selectedItem.currentStatus === "Pending" && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={async () => {
                    // Accept order for this vendor
                    const res = await fetch(
                      `${import.meta.env.VITE_REACT_APP_API}/api/users/orders/${
                        selectedItem._id
                      }/vendor/${StoreId}/accept`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ accepted: true }),
                      }
                    );
                    if (res.ok) {
                      toast.success("Order accepted");
                      setSelectedItem(null);
                      fetchOrders();
                    } else {
                      toast.error("Failed to accept order");
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg"
                >
                  Accept
                </button>
                <button
                  onClick={async () => {
                    // Decline order for this vendor
                    const res = await fetch(
                      `${import.meta.env.VITE_REACT_APP_API}/api/users/orders/${
                        selectedItem._id
                      }/vendor/${StoreId}/accept`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ accepted: false }),
                      }
                    );
                    if (res.ok) {
                      toast.success("Order declined");
                      setSelectedItem(null);
                      fetchOrders();
                    } else {
                      toast.error("Failed to decline order");
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-700 hover:to-red-700 transition-all shadow-lg"
                >
                  Decline
                </button>
              </div>
            )}

            <button
              onClick={() => setSelectedItem(null)}
              className="mt-6 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium hover:from-gray-900 hover:to-black transition-all shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
