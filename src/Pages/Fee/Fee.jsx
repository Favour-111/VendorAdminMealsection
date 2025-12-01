import React, { useState } from "react";
import SideBar from "../../components/SideBar/SideBar";
import { IoMenu } from "react-icons/io5";
import { SlBell } from "react-icons/sl";
const Fee = () => {
  const [openNav, setOpenNav] = useState(false);
  return (
    <div className="flex w-full">
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
        <div className="md:p-4 px-5 mt-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-5 items-center">
              <div
                className="md:hidden flex bg-[#f6f6f6] rounded-[10px] p-3 cursor-pointer"
                onClick={() => setOpenNav(true)}
              >
                <IoMenu size={16} />
              </div>
              <h1 className="font-medium text-xl">Fee Settings </h1>
            </div>
            <div className="bg-[#f6f6f6] w-fit p-2 rounded-4xl">
              <SlBell size={20} />
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <div>
              <p className="text-sm font-light">select University</p>
              <select
                name=""
                id=""
                className="border-1 py-2 w-60 text-sm mt-1 outline-0 border-[#d3d3d3]"
              >
                <option value="">Crawford University</option>
                <option value="">Bowen University</option>
                <option value="">Bells University</option>
              </select>
            </div>
            <div>
              <p className="text-sm font-light">select Vendor</p>
              <select
                name=""
                id=""
                className="border-1 py-2 w-60 text-sm mt-1 outline-0 border-[#d3d3d3]"
              >
                <option value="">Crawford University</option>
                <option value="">Bowen University</option>
                <option value="">Bells University</option>
              </select>
            </div>
            <div>
              <p className="text-sm font-light">service Fee</p>
              <input
                type="text"
                placeholder="input service Fee"
                className="border-1 px-2 py-2 w-60 text-sm mt-1 outline-0 border-[#d3d3d3]"
              />
            </div>
            <div>
              <p className="text-sm font-light">Minimum Delivery Fee</p>
              <input
                placeholder="input delivery Fee here"
                type="text"
                className="border-1 px-2 py-2 w-60 text-sm mt-1 outline-0 border-[#d3d3d3]"
              />
            </div>
            <button className="text-sm text-white font-medium py-2 px-4 bg-[var(--default)] w-[fit-content] rounded">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fee;
