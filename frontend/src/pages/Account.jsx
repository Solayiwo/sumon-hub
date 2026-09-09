import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  ShoppingBag,
  Settings,
  ArrowRight,
  Loader2,
  ChevronRight,
  Package,
  X,
  Truck,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Account = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch complete nested order history from backend on component mount
  useEffect(() => {
    if (!user) return;

    const fetchRecentOrders = async () => {
      try {
        const token = localStorage.getItem("token") || "";

        const response = await fetch("/api/orders", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const contentType = response.headers.get("content-type");
        if (
          response.ok &&
          contentType &&
          contentType.includes("application/json")
        ) {
          const data = await response.json();
          const rawOrders = Array.isArray(data) ? data : data.orders || [];

          // Sort orders: Most recent orders first
          const sortedOrders = [...rawOrders].sort((a, b) => {
            const dateA = new Date(a.order_date || a.createdAt || 0);
            const dateB = new Date(b.order_date || b.createdAt || 0);
            if (dateA.getTime() !== dateB.getTime()) {
              return dateB - dateA;
            }
            // Secondary sort by ID if dates are identical/missing
            return (b.order_id || b.id || 0) - (a.order_id || a.id || 0);
          });

          setRecentOrders(sortedOrders);
        } else {
          setRecentOrders([]);
        }
      } catch (error) {
        console.error("[Account Order History Processing Failure]:", error);
        setRecentOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchRecentOrders();
  }, [user]);

  // Route Guard: Redirect to auth panel if session data drops out of state
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const firstName = user.first_name || user.firstName || "User";

  // Helper function to extract unit price safely
  const getUnitPrice = (item) => {
    const rawPrice = item.unit_price ?? item.price ?? 0;
    return parseFloat(rawPrice) || 0;
  };

  // Modal breakdown calculators
  const modalItems = selectedOrder?.items || [];
  
  // 1. Subtotal
  const modalSubtotal = modalItems.reduce((acc, item) => {
    const unitPrice = getUnitPrice(item);
    const quantity = parseInt(item.quantity, 10) || 1;
    return acc + unitPrice * quantity;
  }, 0);

  // 2. Tax
  const modalTax = parseFloat(
    selectedOrder?.tax ?? selectedOrder?.tax_amount ?? modalSubtotal * 0.08
  );

  // 3. Raw Total
  const modalRawTotal =
    selectedOrder?.total_price ??
    selectedOrder?.total_amount ??
    selectedOrder?.total ??
    null;

  // 4. Multi-fallback shipping cost extractor
  const extractShippingCost = (order) => {
    if (!order) return 0;

    const possibleCosts = [
      order.shipping_cost,
      order.shipping_fee,
      order.shippingCost,
      order.shipping_price,
      order.shipping,
      order.delivery_fee,
      order.deliveryFee,
    ];

    for (const val of possibleCosts) {
      if (val !== undefined && val !== null) {
        if (typeof val === "object" && val.cost !== undefined) {
          return parseFloat(val.cost) || 0;
        }
        if (typeof val === "number") return val;
        if (typeof val === "string") {
          const parsed = parseFloat(val.replace(/[^0-9.-]+/g, ""));
          if (!isNaN(parsed) && parsed > 0) return parsed;
        }
      }
    }

    // Fallback calculation: (Total - Subtotal - Tax)
    if (modalRawTotal !== null) {
      const parsedTotal = parseFloat(modalRawTotal);
      const derivedShipping = parsedTotal - modalSubtotal - modalTax;
      if (derivedShipping > 0.01) {
        return derivedShipping;
      }
    }

    return 0;
  };

  const modalShipping = extractShippingCost(selectedOrder);

  // Final Modal Total
  const modalTotal = modalRawTotal
    ? parseFloat(modalRawTotal)
    : modalSubtotal + modalShipping + modalTax;

  const modalShippingMethod =
    selectedOrder?.shipping_method ||
    selectedOrder?.shipping_type ||
    selectedOrder?.shippingOption ||
    (typeof selectedOrder?.shipping === "object" ? selectedOrder?.shipping?.name : null) ||
    "Shipping";

  return (
    <main className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 antialiased text-slate-900">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden min-h-[620px] p-6 sm:p-10 space-y-8">
        {/* TAB VIEW 1: ACTIVE DASHBOARD PROFILE SUMMARY */}
        {activeTab === "profile" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tight leading-none">
                  Welcome back, {firstName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-1">
                  Manage your store orders.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Profile View Left Side: Snapshot Ledger Row Panel */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Recent Purchase Summary
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-0.5"
                  >
                    View Full History <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {isLoadingOrders ? (
                  <div className="p-12 rounded-xl border border-slate-200/60 bg-slate-50/20 flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                    <p className="text-[11px] font-semibold">
                      Pulling records from server instance...
                    </p>
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders.slice(0, 2).map((order) => (
                      <div
                        key={order.order_id || order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-3 hover:border-indigo-300 transition-all shadow-sm/5 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <ShoppingBag className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                Total Invoice Order #{order.order_id || order.id}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {order.order_date
                                  ? new Date(order.order_date).toLocaleDateString()
                                  : "Recent"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-extrabold text-slate-900">
                              $
                              {Number(
                                order.total_price || order.total_amount || 0
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Inline Item Summary */}
                        <div className="text-[11px] font-semibold text-slate-400 bg-slate-50/60 border border-slate-100 px-3 py-1.5 rounded-lg flex justify-between items-center">
                          <span className="flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5 text-slate-400" /> Containing{" "}
                            {order.items?.length || 0} product line(s)
                          </span>
                          <span className="text-[10px] text-indigo-600 font-bold group-hover:underline">
                            View details
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-1">
                    <p className="text-xs font-bold text-slate-700">
                      No active invoices discovered
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      When you purchase store electronics, invoices will map out right here.
                    </p>
                  </div>
                )}
              </div>

              {/* Profile View Right Side: Navigation Quick links panel */}
              <div className="lg:col-span-5 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Quick Profile Management
                </h2>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("addresses")}
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm text-left transition-all space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        Fulfillment Addresses
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                      Update standard destination metrics to decrease checkout operating times.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("payments")}
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm text-left transition-all space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        Payment Gateway Profiles
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                      Configure wallet signatures, merchant card profiles, and saved billing files.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB VIEW 2: FULL DETAILED HISTORICAL ORDER HISTORY LEDGER */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-slate-900">
                  Complete Purchase History
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  View and manage all past itemized purchases linked to your account profile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 active:scale-[0.98]"
              >
                Return to Profile Dashboard
              </button>
            </div>

            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.order_id || order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="p-5 border border-slate-200 rounded-xl bg-white space-y-4 hover:border-indigo-300 transition-all shadow-sm/5 cursor-pointer group"
                  >
                    {/* Invoice Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          Transaction Index: #{order.order_id || order.id}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {order.order_date
                            ? new Date(order.order_date).toLocaleString()
                            : "Date Pending"}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          order.status === "Completed" || order.status === "Delivered"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {order.status || "Completed"}
                      </span>
                    </div>

                    {/* Itemized Cart Breakdown Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="space-y-2 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Itemized Cart Breakdown
                        </p>
                        <div className="divide-y divide-slate-100">
                          {order.items.map((item, idx) => {
                            const unitPrice = getUnitPrice(item);
                            const qty = parseInt(item.quantity, 10) || 1;
                            return (
                              <div
                                key={item.id || item.product_id || idx}
                                className="py-2 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={
                                      item.image_url ||
                                      item.image ||
                                      item.thumbnail ||
                                      "https://via.placeholder.com/150"
                                    }
                                    alt={item.name || "Product image"}
                                    className="h-10 w-10 rounded-lg object-contain bg-white border border-slate-200/50 p-1 shrink-0"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        "https://via.placeholder.com/150";
                                    }}
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-800 truncate">
                                      {item.name || item.product_name || "Product Item"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                      Purchased quantity: x{qty} &times; ${unitPrice.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-bold text-slate-900 shrink-0">
                                  ${(unitPrice * qty).toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Invoice Footer Summary */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-500 font-semibold">
                        Gross Invoice Statement Amount:
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        $
                        {Number(
                          order.total_price || order.total_amount || 0
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
                <ShoppingBag className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  No orders logged to this profile reference ledger index.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Fallback layout for pending sub-views */}
        {["addresses", "payments"].includes(activeTab) && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 space-y-4 animate-fadeIn">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full w-fit mx-auto">
              <Settings className="h-6 w-6 animate-spin" />
            </div>
            <div className="max-w-xs mx-auto space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                Module Pending Sync
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              Return to Profile Dashboard
            </button>
          </div>
        )}
      </div>

      {/* FULL ORDER SUMMARY MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 my-8">
            {/* Close Modal Button */}
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header Banner */}
            <div className="text-center space-y-2 pt-2">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Order #{selectedOrder.order_id || selectedOrder.id}
              </h2>
              <p className="text-slate-500 text-xs">
                Placed on{" "}
                {selectedOrder.order_date
                  ? new Date(selectedOrder.order_date).toLocaleString()
                  : "N/A"}
              </p>
            </div>

            {/* Status Card */}
            <div className="bg-indigo-600 rounded-xl p-4 text-white flex items-center justify-between shadow-sm">
              <div className="space-y-0.5">
                <p className="text-[10px] text-indigo-200 uppercase tracking-wider font-semibold">
                  Fulfillment Status
                </p>
                <p className="text-base font-bold">
                  {selectedOrder.status || "Completed"}
                </p>
                <p className="text-[11px] text-indigo-100">
                  Estimated Delivery: {modalShipping > 10 ? "1 - 2 Business Days (Express)" : "3 - 5 Business Days"}
                </p>
              </div>
              <Truck className="h-8 w-8 opacity-80" />
            </div>

            {/* Order Items Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
              <h3 className="text-md font-bold text-slate-900 border-b border-slate-100 pb-2">
                Order Summary
              </h3>

              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {modalItems.length > 0 ? (
                  modalItems.map((item, idx) => {
                    const unitPrice = getUnitPrice(item);
                    const qty = parseInt(item.quantity, 10) || 1;
                    const lineTotal = unitPrice * qty;

                    return (
                      <div
                        key={item.id || item.product_id || idx}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-14 w-14 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-lg p-1.5 flex items-center justify-center overflow-hidden">
                            <img
                              src={
                                item.image ||
                                item.image_url ||
                                item.thumbnail ||
                                "https://via.placeholder.com/150"
                              }
                              alt={item.name || `Product #${item.product_id}`}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/150";
                              }}
                            />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <p className="font-semibold text-slate-900 text-xs leading-tight truncate">
                              {item.name ||
                                item.product_name ||
                                `Product #${item.product_id}`}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium">
                              Qty: {qty} &times; ${unitPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right whitespace-nowrap">
                          <span className="font-bold text-slate-900 text-xs block">
                            ${lineTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500">
                    No items found in order.
                  </p>
                )}
              </div>

              <hr className="border-slate-100 my-3" />

              {/* Cost Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">
                    ${modalSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>
                    Shipping{" "}
                    {modalShippingMethod !== "Shipping" && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({modalShippingMethod})
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {modalShipping === 0
                      ? "FREE"
                      : `$${modalShipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax</span>
                  <span className="font-medium text-slate-900">
                    ${modalTax.toFixed(2)}
                  </span>
                </div>

                <hr className="border-slate-100 my-2" />

                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-bold text-slate-900">
                    Total Paid
                  </span>
                  <span className="text-xl font-bold text-indigo-600">
                    ${modalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Action Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition-colors shadow-sm"
              >
                Close Order Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Account;