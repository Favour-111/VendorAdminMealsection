import * as XLSX from "xlsx";

export function exportOrdersToExcel(orders) {
  // Prepare data for export
  const data = orders.map((order) => ({
    date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "",
    username: order.userName || "",
    reference: order.reference || order._id || "",
    status: order.currentStatus || "",
    amount: order.subtotal != null ? order.subtotal : 0,
  }));

  // Define worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  // Export to file
  XLSX.writeFile(workbook, "orders.xlsx");
}
