import React, { useState } from "react";
import { GrAppsRounded } from "react-icons/gr";
import { LuNewspaper } from "react-icons/lu";
import { GrHistory } from "react-icons/gr";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";
import { BsBank, BsBox } from "react-icons/bs";
import { IoGiftOutline, IoWalletOutline } from "react-icons/io5";
import { FiSettings } from "react-icons/fi";
import { CiLogout } from "react-icons/ci";
const SideBar = ({ setOpenNav }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    {
      key: "home",
      label: "Overview",
      to: "/",
      Icon: GrAppsRounded,
      match: (path) => path === "/",
    },
    {
      key: "order",
      label: "Orders",
      to: "/order",
      Icon: LuNewspaper,
      match: (path) => path.startsWith("/order"),
    },
    {
      key: "withdraw",
      label: "Withdraw",
      to: "/withdraw",
      Icon: IoWalletOutline,
      match: (path) => path.startsWith("/withdraw"),
    },
    {
      key: "promotion",
      label: "Menu Management",
      to: "/promotion",
      Icon: BsBox,
      match: (path) => path.startsWith("/promotion"),
    },
    {
      key: "pack-management",
      label: "Pack Management",
      to: "/pack-management",
      Icon: GrHistory,
      match: (path) => path.startsWith("/pack-management"),
    },
  ];

  const isActive = (item) => item.match(location.pathname);

  return (
    <div
      className={`h-screen relative w-full overflow-y-auto border-r border-gray-100 bg-gradient-to-b from-white/90 to-white/70 backdrop-blur`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#9e0505] to-[#c91a1a] grid place-items-center text-white shadow-sm">
            <span className="text-xs font-bold">MS</span>
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-[13px] font-[800] text-gray-900">
                MealSection
              </p>
              <p className="text-[11px] text-gray-500">Vendor Console</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Collapse on desktop */}
          <button
            className="hidden md:inline-flex rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"
            onClick={() => setCollapsed((v) => !v)}
            aria-label="Toggle collapse"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 12h8M12 8l4 4-4 4" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 12H8m4 4-4-4 4-4" />
              </svg>
            )}
          </button>
          {/* Close on mobile */}
          <button
            className="md:hidden p-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            onClick={() => setOpenNav?.(false)}
            aria-label="Close sidebar"
          >
            <AiOutlineClose size={18} />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-2 py-2 space-y-1">
        {items.map(({ key, label, to, Icon }) => {
          const active = isActive({
            match: (p) => (to === "/" ? p === "/" : p.startsWith(to)),
          });
          return (
            <button
              key={key}
              onClick={() => navigate(to)}
              title={collapsed ? label : undefined}
              className={`group relative w-full flex items-center ${
                collapsed ? "justify-center" : "justify-start"
              } gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold transition-all ${
                active
                  ? "bg-[var(--defaultLight)] text-gray-900"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span
                className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg ${
                  active
                    ? "bg-gradient-to-br from-[#9e0505] to-[#c91a1a] text-white shadow"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Icon size={16} />
              </span>
              {!collapsed && <span className="truncate">{label}</span>}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-[var(--default)]" />
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="my-2 h-px bg-gray-100" />

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.clear();
            window.location.replace("/");
          }}
          title={collapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center ${
            collapsed ? "justify-center" : "justify-start"
          } gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold text-red-600 transition-all hover:bg-red-50`}
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-red-100 text-red-600">
            <CiLogout />
          </span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </nav>
    </div>
  );
};

export default SideBar;
