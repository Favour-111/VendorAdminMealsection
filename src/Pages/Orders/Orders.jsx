import React, { useEffect, useMemo, useState, useRef } from "react";
import { exportOrdersToExcel } from "../../utils/exportOrders";
import SideBar from "../../components/SideBar/SideBar";
import { IoCheckmark, IoClose, IoMenu } from "react-icons/io5";
import { SlBell } from "react-icons/sl";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import { GoPackage } from "react-icons/go";
import { MdClose, MdOutlineContentPasteSearch } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import "../Home/Home.css";
import { useSocket } from "../../context/SocketContext.jsx";
const Orders = () => {
  const [openNav, setOpenNav] = useState(false);
  const { socket } = useSocket?.() || {};
  const [vendors, setVendors] = useState([]);
  const [Messagemodal, setMessagemodal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const loading = ordersLoading || vendorsLoading;
  const [allOrder, setAllOrders] = useState([]);
  const [accepted, setAccepted] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState({
    type: "accepted",
    orderId: "",
  });
  const pendingRequestsRef = useRef(new Set()); // ✅ Track pending requests to prevent duplicates

  const storeId = localStorage.getItem("StoreId");
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/users/orders`,
      );
      if (response && response.data.orders) {
        setAllOrders(response.data.orders);
      } else {
        toast.error("Error fetching orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Something went wrong fetching orders");
    } finally {
      setOrdersLoading(false);
    }
  };
  const fetchVendors = async () => {
    try {
      setVendorsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/vendors/all`,
      );
      if (response && response.data) {
        setVendors(response.data);
      } else {
        toast.error("Error fetching Vendors");
      }
    } catch (error) {
      console.error("Error fetching Vendors:", error);
      toast.error("Something went wrong fetching Vendors");
    } finally {
      setVendorsLoading(false);
    }
  };
  useEffect(() => {
    fetchOrders();
    fetchVendors();
  }, []);

  // ✅ Join socket room for real-time updates
  useEffect(() => {
    if (socket && storeId) {
      socket.emit("join", {
        role: "vendor",
        storeId: storeId,
      });
      console.log(`✅ Vendor ${storeId} joined socket room`);
    }
  }, [socket, storeId]);

  // Live refresh on socket events
  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchOrders();
    socket.on("orders:new", handler);
    socket.on("orders:status", handler);
    socket.on("vendors:packsUpdated", handler);
    socket.on("orders:message", handler);
    return () => {
      socket.off("orders:new", handler);
      socket.off("orders:status", handler);
      socket.off("vendors:packsUpdated", handler);
      socket.off("orders:message", handler);
    };
  }, [socket]);
  const VendorFilter = vendors.find((item) => item._id === storeId);
  const vendor = VendorFilter?.storeName;

  const filteredOrders = allOrder
    .map((order) => {
      // Make sure order.packs exists and is an array before filtering
      const vendorPacks = Array.isArray(order.packs)
        ? order.packs.filter((pack) => pack.vendorId === storeId)
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

  console.log(filteredOrders);
  // Derived counts for summary cards
  const totalOrders = filteredOrders.length;
  const completedCount = useMemo(
    () => filteredOrders.filter((o) => o.currentStatus === "Delivered").length,
    [filteredOrders],
  );
  const awaitingCount = useMemo(
    () =>
      filteredOrders.filter(
        (item) =>
          item.currentStatus === "Pending" &&
          item.packs.some((pack) => pack.accepted === true),
      ).length,

    [filteredOrders],
  );
  const ongoingCount = useMemo(
    () =>
      filteredOrders.filter(
        (item) =>
          item.currentStatus === "Pending" &&
          item.packs.some((pack) => pack.accepted === true),
      ).length,
    [filteredOrders],
  );
  const declinedCount = useMemo(
    () =>
      filteredOrders.filter((item) =>
        item.packs.some((pack) => pack.accepted === false),
      ).length,
    [filteredOrders],
  );
  const handleDecision = async (decision, orderId, vendorId) => {
    try {
      setDecisionLoading(orderId);
      const res = await axios.put(
        `${
          import.meta.env.VITE_REACT_APP_API
        }/api/users/orders/${orderId}/vendor/${vendorId}/accept`,
        { accepted: decision },
      );
      console.log("✅ Packs updated:", res.data);
      setSuccessInfo({
        type: decision ? "accepted" : "declined",
        orderId: orderId.slice(0, 8),
      });
      setShowSuccessModal(true);
      await fetchOrders();
    } catch (err) {
      console.error("Failed to update:", err);
      toast.error("Failed to update order. Please try again.");
    } finally {
      setDecisionLoading(null);
    }
  };

  const sendMessageToUser = async (orderId) => {
    try {
      setMessageLoading(true);
      const res = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API
        }/api/users/orders/${orderId}/message`,
        { message: messageText },
      );
      toast.success("Message sent successfully!");
      setMessagemodal(null);
      setMessageText("");
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message");
    } finally {
      setMessageLoading(false);
    }
  };
  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
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

      <div className="flex-1 md:ml-[240px] w-full overflow-y-auto">
        <div className="md:p-6 px-5 mt-3 pb-10">
          {/* Header + Export */}
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
                  Orders
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage incoming, ongoing and completed orders
                </p>
              </div>
            </div>
            <button
              className="ml-4 px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow hover:from-green-600 hover:to-emerald-700 transition-all"
              onClick={() => exportOrdersToExcel(filteredOrders)}
              disabled={loading || filteredOrders.length === 0}
              title="Export orders as Excel"
            >
              Export Orders
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <GoPackage className="text-white/90" size={18} />
                  <p className="text-xs font-medium text-white/90">Total</p>
                </div>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <MdOutlineContentPasteSearch
                    className="text-white/90"
                    size={18}
                  />
                  <p className="text-xs font-medium text-white/90">Awaiting</p>
                </div>
                <p className="text-2xl font-bold">{awaitingCount}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <IoCheckmark className="text-white/90" size={18} />
                  <p className="text-xs font-medium text-white/90">Completed</p>
                </div>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <IoClose className="text-white/90" size={18} />
                  <p className="text-xs font-medium text-white/90">Declined</p>
                </div>
                <p className="text-2xl font-bold">{declinedCount}</p>
              </div>
            </div>
          </div>
          <div className="mt-7">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-blue-500 rounded-full" />
              New Orders
            </h2>
            <div className="overflow-x-auto mt-4">
              {loading ? (
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {[1, 2, 3].map((i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-28 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 w-28 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full animate-pulse" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : filteredOrders.filter((item) =>
                  item.packs.some((pack) => pack.accepted === null),
                ).length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                    <GoPackage className="text-blue-500" size={32} />
                  </div>
                  <p className="text-gray-600 font-medium">
                    No new orders found
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Awaiting customer orders
                  </p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredOrders
                      .filter(
                        (item) =>
                          item.currentStatus === "Pending" &&
                          item.packs.some((pack) => pack.accepted === null),
                      )
                      .reverse()
                      .slice(0, 6)
                      .map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                              #{item._id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.userName}
                          </td>
                          <td className="px-6 whitespace-nowrap py-4 text-xs text-gray-600">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  handleDecision(true, item._id, storeId)
                                }
                                disabled={decisionLoading === item._id}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-medium hover:from-emerald-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {decisionLoading === item._id ? (
                                  <>
                                    <svg
                                      className="animate-spin h-4 w-4"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                      />
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      />
                                    </svg>
                                    Accepting...
                                  </>
                                ) : (
                                  "Accept"
                                )}
                              </button>

                              <button
                                onClick={() =>
                                  handleDecision(false, item._id, storeId)
                                }
                                disabled={decisionLoading === item._id}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-medium hover:from-rose-600 hover:to-red-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {decisionLoading === item._id ? (
                                  <>
                                    <svg
                                      className="animate-spin h-4 w-4"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                      />
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      />
                                    </svg>
                                    Declining...
                                  </>
                                ) : (
                                  "Decline"
                                )}
                              </button>

                              {/* <button
                                onClick={() => setMessagemodal(item._id)}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-xs font-medium hover:from-cyan-600 hover:to-sky-700 transition-all shadow-sm hover:shadow-md"
                              >
                                Unavailable
                              </button> */}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="mt-7">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-amber-500 rounded-full" />
              Ongoing deliveries
            </h2>
            <div className="overflow-x-auto mt-4">
              {loading ? (
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {[1, 2, 3].map((i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-28 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 w-28 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full animate-pulse" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : filteredOrders.filter(
                  (item) =>
                    item.currentStatus === "Pending" &&
                    item.packs.some((pack) => pack.accepted === true),
                ).length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-full mb-4">
                    <MdOutlineContentPasteSearch
                      className="text-amber-500"
                      size={32}
                    />
                  </div>
                  <p className="text-gray-600 font-medium">
                    No ongoing deliveries
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Accepted orders will appear here
                  </p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredOrders
                      .filter(
                        (item) =>
                          item.currentStatus === "Pending" &&
                          item.packs.some((pack) => pack.accepted === true),
                      )
                      .reverse()
                      .map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-amber-50/30 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                              #{item._id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.userName}
                          </td>
                          <td className="px-6 whitespace-nowrap py-4 text-xs text-gray-600">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                                Pending
                              </span>
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div className="mt-7">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-emerald-500 rounded-full" />
              Completed Deliveries
            </h2>
            <div className="overflow-x-auto mt-4">
              {loading ? (
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {[1, 2, 3].map((i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-28 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 w-28 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full animate-pulse" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : filteredOrders.filter(
                  (item) => item.currentStatus === "Delivered",
                ).length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full mb-4">
                    <IoCheckmark className="text-emerald-500" size={36} />
                  </div>
                  <p className="text-gray-600 font-medium">
                    No completed deliveries yet
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Delivered orders will appear here
                  </p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredOrders
                      .filter((item) => item.currentStatus === "Delivered")
                      .reverse()
                      .map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-emerald-50/20 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                              #{item._id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.userName}
                          </td>
                          <td className="px-6 whitespace-nowrap py-4 text-xs text-gray-600">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                                <IoCheckmark size={14} />
                                Delivered
                              </span>
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div className="mt-7">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-rose-500 rounded-full" />
              Declined Deliveries
            </h2>
            <div className="overflow-x-auto mt-4">
              {loading ? (
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {[1, 2, 3].map((i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-28 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 w-28 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full animate-pulse" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : filteredOrders.filter((item) =>
                  item.packs.some((pack) => pack.accepted === false),
                ).length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-50 rounded-full mb-4">
                    <IoClose className="text-rose-500" size={32} />
                  </div>
                  <p className="text-gray-600 font-medium">
                    No declined orders
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Declined orders will appear here
                  </p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredOrders
                      .filter((item) =>
                        item.packs.some((pack) => pack.accepted === false),
                      )
                      .reverse()
                      .map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-rose-50/20 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg">
                              #{item._id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.userName}
                          </td>
                          <td className="px-6 whitespace-nowrap py-4 text-xs text-gray-600">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 items-center">
                              <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                                Cancelled
                              </span>
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
            {/* Success Modal for Vendor Decision */}
            {showSuccessModal && (
              <div className="fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-slideUp">
                  {/* Confetti dots */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    <div
                      className="absolute top-3 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-ping"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="absolute top-10 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                      style={{ animationDelay: "0.3s" }}
                    />
                    <div
                      className="absolute top-6 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-ping"
                      style={{ animationDelay: "0.5s" }}
                    />
                    <div
                      className="absolute top-8 right-1/3 w-2 h-2 bg-pink-400 rounded-full animate-ping"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>

                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div
                        className={`w-20 h-20 ${
                          successInfo.type === "accepted"
                            ? "bg-gradient-to-br from-emerald-400 to-green-500"
                            : "bg-gradient-to-br from-rose-400 to-red-500"
                        } rounded-full flex items-center justify-center animate-bounce`}
                      >
                        {successInfo.type === "accepted" ? (
                          <IoCheckmark className="text-white" size={48} />
                        ) : (
                          <IoClose className="text-white" size={48} />
                        )}
                      </div>
                      <div
                        className={`absolute inset-0 w-20 h-20 ${
                          successInfo.type === "accepted"
                            ? "bg-emerald-400"
                            : "bg-rose-400"
                        } rounded-full animate-ping opacity-20`}
                      />
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {successInfo.type === "accepted"
                        ? "Order Accepted!"
                        : "Order Declined"}
                    </h2>
                    <p className="text-gray-600 mb-1">
                      Update recorded for order
                    </p>
                    <p
                      className={`font-mono text-lg font-bold ${
                        successInfo.type === "accepted"
                          ? "text-emerald-600 bg-emerald-50"
                          : "text-rose-600 bg-rose-50"
                      } inline-block px-4 py-2 rounded-xl mt-2`}
                    >
                      #{successInfo.orderId}
                    </p>
                    <p className="text-sm text-gray-500 mt-4">
                      The customer will see this update immediately.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSuccessModal(false)}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold hover:from-gray-200 hover:to-gray-300 transition-all"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowSuccessModal(false);
                        // Scroll to ongoing deliveries
                        window.scrollTo({ top: 500, behavior: "smooth" });
                      }}
                      className={`flex-1 px-6 py-3 rounded-xl ${
                        successInfo.type === "accepted"
                          ? "bg-gradient-to-r from-emerald-500 to-green-600"
                          : "bg-gradient-to-r from-rose-500 to-red-600"
                      } text-white font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl`}
                    >
                      View Orders
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedItem && (
              <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                  >
                    <MdClose
                      className="text-gray-500 group-hover:text-gray-700"
                      size={20}
                    />
                  </button>

                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      Order Details
                    </h2>
                    <p className="text-sm text-gray-500">
                      Order #{selectedItem._id.slice(0, 10)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {selectedItem?.packs.map((pack, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100"
                      >
                        <h3 className="text-sm font-bold text-gray-900 mb-2">
                          {pack.name}
                        </h3>
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Items
                          </p>
                          {pack.items.map((it, i2) =>
                            (() => {
                              console.log("Order Item:", it);
                              return (
                                <div
                                  key={i2}
                                  className="flex justify-between items-center text-xs text-gray-700 bg-white/60 px-3 py-2 rounded-lg"
                                >
                                  <div className="flex flex-col">
                                    <span>{it.name}</span>
                                    <span className="text-xs text-gray-600 font-medium">
                                      {it.price !== undefined
                                        ? `₦${Number(
                                            it.price,
                                          ).toLocaleString()}`
                                        : "No price"}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-gray-900">
                                    ×{it.quantity}
                                  </span>
                                </div>
                              );
                            })(),
                          )}
                          {/* Show selected pack type and price */}
                          <div className="mt-2 text-xs text-gray-700">
                            <span className="font-semibold">Pack Type:</span>{" "}
                            <span className="bg-amber-800 text-white px-3 py-0.5 rounded-full">
                              {pack.packType || "N/A"}
                            </span>
                          </div>
                          {/* Show vendor note if available */}
                          {selectedItem.vendorNote && (
                            <div className="mt-2 text-xs text-gray-700">
                              <span className="font-semibold">
                                Vendor Note:
                              </span>{" "}
                              {selectedItem.vendorNote}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedItem(null)}
                    className="mt-6 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium hover:from-gray-900 hover:to-black transition-all shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            {Messagemodal && (
              <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slideUp">
                  <button
                    onClick={() => setMessagemodal(null)}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                  >
                    <MdClose
                      className="text-gray-500 group-hover:text-gray-700"
                      size={20}
                    />
                  </button>

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Mark Items Unavailable
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Your note will be sent to the customer
                    </p>
                  </div>
                  <textarea
                    className="rounded-xl border-2 border-gray-200 p-3 h-40 outline-none w-full resize-none placeholder:text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="E.g., Jollof rice (2) is unavailable. Please pick fried rice instead."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setMessagemodal(null)}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => sendMessageToUser(Messagemodal)}
                      disabled={messageLoading}
                      className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {messageLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Sending...
                        </>
                      ) : (
                        "Send message"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
