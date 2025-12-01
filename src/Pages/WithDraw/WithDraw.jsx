import React, { useState, useEffect, useMemo } from "react";
import SideBar from "../../components/SideBar/SideBar";
import { IoCheckmark, IoClose, IoMenu } from "react-icons/io5";
import { SlBell } from "react-icons/sl";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import axios from "axios";
import { GoPackage } from "react-icons/go";
import { MdClose, MdOutlineContentPasteSearch } from "react-icons/md";
import { GiMoneyStack } from "react-icons/gi";
import toast from "react-hot-toast";
import { CiMoneyCheck1 } from "react-icons/ci";
import "../Home/Home.css";
const WithDraw = () => {
  const [openNav, setOpenNav] = useState(false);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState([]);
  const [vendorWithDraws, SetWithDrawal] = useState([]);
  const StoreId = localStorage.getItem("StoreId");

  const FetchStore = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/vendors/all`
      );
      if (res) {
        setVendor(res.data);
      } else {
        toast.error("error fetching Vendors");
      }
    } catch (e) {
      toast.error("Failed to fetch vendor info");
    } finally {
      setLoading(false);
    }
  };
  const FetchWithDraw = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/vendors/withdrawals`
      );
      if (res) {
        SetWithDrawal(res.data.withdrawals);
      } else {
        toast.error("error fetching withdrawals");
      }
    } catch (e) {
      toast.error("Failed to fetch withdrawals");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    FetchWithDraw();
    FetchStore();
  }, []);
  const filterVendor = vendor?.find((item) => item._id === StoreId);
  console.log(vendorWithDraws);

  const myWithdrawals = useMemo(
    () => vendorWithDraws.filter((w) => w.vendorId._id === StoreId),
    [vendorWithDraws, StoreId]
  );
  const pending = useMemo(
    () => myWithdrawals.filter((w) => w.status === null),
    [myWithdrawals]
  );
  const completed = useMemo(
    () => myWithdrawals.filter((w) => w.status === true),
    [myWithdrawals]
  );
  const rejected = useMemo(
    () => myWithdrawals.filter((w) => w.status === false),
    [myWithdrawals]
  );
  const sumAmount = (arr) =>
    arr.reduce((acc, w) => acc + Number(w.amount || 0), 0);

  const handleWithdraw = async () => {
    try {
      setLoading(true);
      const vendorId = filterVendor._id;
      const vendorName = filterVendor.storeName;
      if (amount > filterVendor?.availableBal) {
        toast.error("insufficient Balance");
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_REACT_APP_API}/api/vendors/withdrawals`,
          { vendorId, vendorName, amount: Number(amount) }
        );
        if (res) {
          toast.success("Withdrawal request sent!");
          setModal(false);
          FetchWithDraw();
          FetchStore();
          setAmount("");
        }
      }
    } catch (err) {
      console.error("Error sending withdrawal:", err);
      toast.error("Failed to send withdrawal request");
    } finally {
      setLoading(false);
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
                  Withdrawals
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage balance, requests and payout history
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <CiMoneyCheck1 className="text-white/90" size={18} />
                  <p className="text-xs font-medium text-white/90">Balance</p>
                </div>
                <p className="text-2xl font-bold">
                  ₦{Number(filterVendor?.availableBal || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <GiMoneyStack className="text-white/90" size={18} />
                  <p className="text-xs font-medium text-white/90">Pending</p>
                </div>
                <p className="text-2xl font-bold">
                  ₦{sumAmount(pending).toLocaleString()}
                </p>
                <p className="text-[11px] text-white/80">
                  {pending.length} requests
                </p>
              </div>
            </div>
            <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <FaRegMoneyBillAlt className="text-white/90" size={18} />
                  <p className="text-xs font-medium text-white/90">Completed</p>
                </div>
                <p className="text-2xl font-bold">
                  ₦{sumAmount(completed).toLocaleString()}
                </p>
                <p className="text-[11px] text-white/80">
                  {completed.length} payouts
                </p>
              </div>
            </div>
            <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <IoClose className="text-white/90" size={18} />
                  <p className="text-xs font-medium text-white/90">Rejected</p>
                </div>
                <p className="text-2xl font-bold">{rejected.length}</p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="rounded-2xl p-4 bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">
                    Request a payout to your account
                  </p>
                </div>
                <button
                  onClick={() => setModal(true)}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-violet-700 transition-all shadow-sm hover:shadow-md"
                >
                  Request Withdraw
                </button>
              </div>
            </div>
          </div>

          {modal && (
            <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slideUp">
                <button
                  onClick={() => setModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <MdClose
                    className="text-gray-500 group-hover:text-gray-700"
                    size={20}
                  />
                </button>

                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  New Withdrawal
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Enter the amount to withdraw from your available balance
                </p>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="mt-1 w-full px-3 py-3 rounded-xl border-2 border-gray-200 placeholder:text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Available: ₦
                    {Number(filterVendor?.availableBal || 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    onClick={handleWithdraw}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg disabled:opacity-70"
                  >
                    {loading ? "Processing..." : "Withdraw"}
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="mt-7">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-purple-500 rounded-full" />
              Withdrawal History
            </h2>

            {loading ? (
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {[1, 2, 3, 4].map((i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full animate-pulse" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : myWithdrawals.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-full mb-4">
                  <GiMoneyStack className="text-purple-500" size={32} />
                </div>
                <p className="text-gray-600 font-medium">No withdrawals yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create your first withdrawal request
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-100">
                    {myWithdrawals.map((w) => (
                      <tr
                        key={w._id}
                        className="hover:bg-purple-50/20 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                          {new Date(w.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-red-600">
                          ₦-{Number(w.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {w.status === null ? (
                            <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                              Pending
                            </span>
                          ) : w.status === true ? (
                            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                              Completed
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                              Rejected
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* <div className="mt-7">
            <h1>Transaction History </h1>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      TransactionId
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      20-10-2025
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Jhone doe
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">Rider</td>
                    <td className="px-6 py-4 text-sm text-gray-900">2,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default WithDraw;
