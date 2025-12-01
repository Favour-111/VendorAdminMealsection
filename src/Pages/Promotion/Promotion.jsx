import React, { useState, useEffect } from "react";
import { fetchProductsByVendor } from "../../services/productService";
import SideBar from "../../components/SideBar/SideBar";
import { IoMenu } from "react-icons/io5";
import { SlBell } from "react-icons/sl";
import { MdClose } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import "../Home/Home.css";

const Promotion = () => {
  const [openNav, setOpenNav] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loader, setLoader] = useState(false);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [toggling, setToggling] = useState({}); // per-product availability toggle loading
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    image: "",
  });

  const StoreId = localStorage.getItem("StoreId");

  // 🧠 Fetch all products for this vendor
  const fetchVendors = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/vendors/all`
      );
      setVendors(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load vendor");
    }
  };
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProductsByVendor(StoreId);
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchProducts();
  }, []);

  // ✏️ Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Add New Product
  const handleAddProduct = async () => {
    if (!formData.title || !formData.price || !formData.category) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoader(true);
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API}/api/vendors/add`,
        {
          vendorId: StoreId,
          ...formData,
        }
      );
      toast.success("Product added successfully");
      setModal(false);
      setFormData({ title: "", price: "", category: "", image: "" });
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error adding product");
    } finally {
      setLoader(false);
    }
  };

  // 🗑️ Delete Product
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_API}/api/vendors/delete/${id}`
      );
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };
  // ✏️ Edit Product
  const handleEditProduct = async () => {
    if (!formData.title || !formData.price || !formData.category) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoader(true);
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API}/api/vendors/edit/${editId}`,
        {
          vendorId: StoreId,
          ...formData,
        }
      );
      toast.success("Product updated successfully");
      setModal(false);
      setEditMode(false);
      setFormData({ title: "", price: "", category: "", image: "" });
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating product");
    } finally {
      setLoader(false);
    }
  };

  // 🔁 Toggle Availability
  const handleToggle = async (id) => {
    setToggling((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_REACT_APP_API}/api/vendors/toggle/${id}`
      );
      toast.success(
        `Availability changed to ${res.data.available ? "Active" : "Inactive"}`
      );
      fetchProducts();
    } catch (err) {
      toast.error("Failed to toggle availability");
    } finally {
      setToggling((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Sidebar Overlay */}
      {openNav && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpenNav(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-50 transform transition-transform duration-300
        ${openNav ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 w-[270px] md:w-[240px]`}
      >
        <SideBar setOpenNav={setOpenNav} />
      </div>

      {/* Main Content */}
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
                  Menu Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Create, edit, and organize your products
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setModal(true)}
                className="hidden md:inline-flex items-center justify-center rounded-xl text-xs font-semibold px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-sm hover:from-purple-700 hover:to-violet-700 transition-all"
              >
                Add New Item
              </button>
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 w-fit p-3 rounded-xl shadow-sm">
                <SlBell size={14} className="text-gray-600" />
              </div>
            </div>
          </div>

          {/* Mobile Add Button below header */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setModal(true)}
              className="w-full inline-flex items-center justify-center rounded-xl text-sm font-semibold px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-sm hover:from-purple-700 hover:to-violet-700 transition-all"
            >
              Add New Item
            </button>
          </div>

          {/* 🔳 Add Product Modal */}
          {modal && (
            <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="relative bg-white rounded-2xl p-6 w-[90%] md:w-[480px] shadow-2xl animate-slideUp">
                <button
                  onClick={() => setModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <MdClose
                    size={18}
                    className="text-gray-500 group-hover:text-gray-700"
                  />
                </button>

                <h2 className="text-xl font-bold text-gray-900">
                  {editMode ? "Update Item" : "Add New Item"}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Fill out the fields to {editMode ? "update" : "add"} a product
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      Product Title
                    </label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter product name"
                      className="mt-1 border-2 outline-none border-gray-200 placeholder:text-sm py-2.5 px-3 rounded-xl w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      Product Price
                    </label>
                    <input
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="Enter product price"
                      className="mt-1 border-2 outline-none border-gray-200 placeholder:text-sm py-2.5 px-3 rounded-xl w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 mt-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 text-sm text-gray-700 border-2 outline-none border-gray-200 py-2.5 px-3 rounded-xl w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    >
                      <option value="">Select Category</option>
                      <option value="Carbohydrate">Carbohydrate</option>
                      <option value="Protein">Protein</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Pastries">Pastries</option>
                      <option value="Packs">Packs</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 w-full">
                  <label className="text-xs font-medium text-gray-600">
                    Product Image Link
                  </label>
                  <input
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="Paste image URL"
                    className="mt-1 border-2 outline-none border-gray-200 placeholder:text-sm py-2.5 px-3 rounded-xl w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={editMode ? handleEditProduct : handleAddProduct}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl px-6 py-3 text-sm font-semibold hover:from-purple-700 hover:to-violet-700 transition-all shadow-sm hover:shadow-md"
                  >
                    {loader
                      ? "Loading..."
                      : editMode
                      ? "Update Product"
                      : "Add Product"}
                  </button>

                  <button
                    onClick={() => {
                      setModal(false);
                      setEditMode(false);
                      setFormData({
                        title: "",
                        price: "",
                        category: "",
                        image: "",
                      });
                    }}
                    className="flex-1 border-2 border-gray-200 rounded-xl px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 📦 Products Table */}
          <div className="mt-7 overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Availability
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="h-8 w-52 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-gradient-to-r from-gray-100 to-gray-50 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-5 w-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 w-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-5 w-16 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full animate-pulse" />
                        </td>
                      </tr>
                    ))}
                  </>
                ) : products.length > 0 ? (
                  products
                    .filter((item) => item.vendorId === StoreId)
                    .map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-purple-50/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 text-sm text-gray-900">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-10 h-10 rounded-md object-cover shadow-sm"
                            />
                            <div className="font-medium">{item.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ₦{Number(item.price).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {item.available === true ? (
                            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 text-xs px-3 py-1.5 rounded-full border border-emerald-200">
                              <span className="bg-emerald-500 h-1.5 w-1.5 rounded-full"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 text-xs px-3 py-1.5 rounded-full border border-rose-200">
                              <span className="bg-rose-500 h-1.5 w-1.5 rounded-full"></span>
                              Deactivated
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                              onClick={() => {
                                setEditMode(true);
                                setEditId(item._id);
                                setFormData({
                                  title: item.title,
                                  price: item.price,
                                  category: item.category,
                                  image: item.image,
                                });
                                setModal(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="px-3 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-medium hover:from-rose-600 hover:to-red-700 transition-all shadow-sm hover:shadow-md"
                              onClick={() => handleDelete(item._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[12px]">
                          <button
                            onClick={() =>
                              !toggling[item._id] && handleToggle(item._id)
                            }
                            disabled={!!toggling[item._id]}
                            aria-pressed={item.available}
                            aria-label={
                              item.available
                                ? "Set item inactive"
                                : "Set item active"
                            }
                            className={`group relative inline-flex items-center gap-2 px-2 py-1 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${
                              item.available
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-700 shadow-sm"
                                : "bg-gradient-to-r from-orange-500 to-amber-500 border-orange-600 shadow-sm"
                            } ${
                              toggling[item._id]
                                ? "opacity-70 cursor-wait"
                                : "cursor-pointer"
                            }`}
                          >
                            <span className="relative h-5 w-10 flex items-center">
                              <span
                                className={`absolute inset-0 rounded-full ${
                                  item.available ? "bg-white/20" : "bg-black/20"
                                }`}
                              />
                              <span
                                className={`relative h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
                                  item.available
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                }`}
                              >
                                {toggling[item._id] && (
                                  <svg
                                    className="animate-spin h-3 w-3 text-gray-500 absolute inset-0 m-auto"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                  </svg>
                                )}
                              </span>
                            </span>
                            <span className="text-[10px] font-semibold text-white tracking-wide">
                              {toggling[item._id]
                                ? "Saving..."
                                : item.available
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-16">
                      <div className="text-center bg-white rounded-xl border border-gray-100 py-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-full mb-3">
                          <span className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-violet-600" />
                        </div>
                        <p className="text-gray-600 font-medium">
                          No products found
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Click "Add New Item" to create your first product
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotion;
