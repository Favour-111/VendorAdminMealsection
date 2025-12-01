import { useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";

/**
 * Vendor notification hook - listens for new orders and updates
 */
export function useVendorNotifications(vendorId) {
  const { socket } = useSocket?.() || {};
  const audioRef = useRef(null);

  useEffect(() => {
    if (!socket || !vendorId) return;

    // Create notification sound
    if (!audioRef.current) {
      audioRef.current = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLTgjMGHm7A7+OZURE"
      );
    }

    const playNotificationSound = () => {
      try {
        audioRef.current?.play();
      } catch (err) {
        console.log("Could not play notification sound:", err);
      }
    };

    // Listen for new orders that include this vendor
    const handleOrderNew = (order) => {
      const hasPack = order.packs?.some(
        (p) => String(p.vendorId) === String(vendorId)
      );

      if (hasPack) {
        playNotificationSound();

        const itemCount = order.packs
          .filter((p) => String(p.vendorId) === String(vendorId))
          .reduce((sum, p) => sum + (p.items?.length || 0), 0);

        toast(
          (t) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔔</span>
                <div>
                  <p className="font-bold text-gray-900">New Order Received!</p>
                  <p className="text-sm text-gray-600">
                    {itemCount} item(s) • Order #{order._id?.slice(-6)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  window.location.href = "/order";
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
              >
                View Order
              </button>
            </div>
          ),
          {
            duration: 10000,
            style: {
              background: "#fff",
              padding: "16px",
            },
          }
        );
      }
    };

    // Listen for order status changes
    const handleOrderStatus = (updatedOrder) => {
      const hasPack = updatedOrder.packs?.some(
        (p) => String(p.vendorId) === String(vendorId)
      );

      if (hasPack) {
        const status = updatedOrder.currentStatus?.toLowerCase();
        let message = "";

        if (status === "delivered") {
          message = `✅ Order #${updatedOrder._id?.slice(-6)} delivered!`;
          playNotificationSound();
          toast.success(message, { duration: 5000 });
        }
      }
    };

    // Register socket listeners
    socket.on("orders:new", handleOrderNew);
    socket.on("orders:status", handleOrderStatus);

    // Cleanup
    return () => {
      socket.off("orders:new", handleOrderNew);
      socket.off("orders:status", handleOrderStatus);
    };
  }, [socket, vendorId]);
}
