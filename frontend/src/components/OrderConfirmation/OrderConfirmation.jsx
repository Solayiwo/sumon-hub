import { useLocation, useParams, Link } from "react-router-dom";
import { CheckCircle, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const orderData = location.state?.order;

  // Extract items list
  const items = orderData?.items || [];

  // Helper function to safely extract unit price
  const getUnitPrice = (item) => {
    const rawPrice = item.unit_price ?? item.price ?? 0;
    return parseFloat(rawPrice) || 0;
  };

  // Calculate subtotal
  const subtotal = items.reduce((acc, item) => {
    const unitPrice = getUnitPrice(item);
    const quantity = parseInt(item.quantity, 10) || 1;
    return acc + unitPrice * quantity;
  }, 0);

  // Extract tax safely
  const tax = parseFloat(
    orderData?.tax ?? orderData?.tax_amount ?? subtotal * 0.08
  );

  // Extract grand total safely
  const rawTotal =
    orderData?.total_price ??
    orderData?.total_amount ??
    orderData?.total ??
    null;

  // Robust extraction for shipping cost across all potential data structures
  const extractShippingCost = () => {
    // Direct primitive checks
    const possibleCosts = [
      orderData?.shipping_cost,
      orderData?.shipping_fee,
      orderData?.shippingCost,
      orderData?.shipping_price,
      orderData?.shipping,
      orderData?.delivery_fee,
      orderData?.deliveryFee,
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

    // Fallback: If grand total exists, derive shipping from (Total - Subtotal - Tax)
    if (rawTotal !== null) {
      const parsedTotal = parseFloat(rawTotal);
      const derivedShipping = parsedTotal - subtotal - tax;
      if (derivedShipping > 0.01) {
        return derivedShipping;
      }
    }

    return 0;
  };

  const shippingCost = extractShippingCost();

  // Final Total calculation
  const total = rawTotal
    ? parseFloat(rawTotal)
    : subtotal + shippingCost + tax;

  // Extract method name (e.g. Express vs Standard)
  const shippingMethod =
    orderData?.shipping_method ||
    orderData?.shipping_type ||
    orderData?.shippingOption ||
    (typeof orderData?.shipping === "object" ? orderData?.shipping?.name : null) ||
    "Shipping";

  return (
    <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Thank You for Your Order!
          </h1>
          <p className="text-slate-600 text-sm">
            Your order has been placed successfully and recorded under Order ID:{" "}
            <span className="font-semibold text-indigo-600">#{orderId}</span>
          </p>
        </div>

        {/* Status card */}
        <div className="bg-indigo-600 rounded-xl p-6 text-white flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">
              Estimated Delivery
            </p>
            <p className="text-lg font-bold">
              {shippingCost > 10 ? "1 - 2 Business Days (Express)" : "3 - 5 Business Days"}
            </p>
            <p className="text-xs text-indigo-100">Status: Order Processing</p>
          </div>
          <Truck className="h-10 w-10 opacity-80" />
        </div>

        {/* Details card matching reference image */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Order Summary
          </h2>

          {/* Item List with Thumbnail Image, Unit Price & Subtotal */}
          <div className="space-y-4">
            {items.length > 0 ? (
              items.map((item, idx) => {
                const unitPrice = getUnitPrice(item);
                const quantity = parseInt(item.quantity, 10) || 1;
                const lineTotal = unitPrice * quantity;

                return (
                  <div
                    key={item.product_id || item.id || idx}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-16 w-16 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center justify-center overflow-hidden">
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
                            e.target.src = "https://via.placeholder.com/150";
                          }}
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="font-semibold text-slate-900 text-sm leading-tight truncate">
                          {item.name || `Product #${item.product_id}`}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Qty: {quantity} &times; ${unitPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right whitespace-nowrap">
                      <span className="font-bold text-slate-900 text-sm block">
                        ${lineTotal.toFixed(2)}
                      </span>
                      {quantity > 1 && (
                        <span className="text-[11px] text-slate-400 block">
                          (${unitPrice.toFixed(2)} each)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500">No items found in order.</p>
            )}
          </div>

          <hr className="border-slate-100 my-4" />

          {/* Cost Breakdown */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>
                Shipping{" "}
                {shippingMethod !== "Shipping" && (
                  <span className="text-xs text-slate-400 font-medium">
                    ({shippingMethod})
                  </span>
                )}
              </span>
              <span className="font-semibold text-slate-900">
                {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax</span>
              <span className="font-medium text-slate-900">
                ${tax.toFixed(2)}
              </span>
            </div>

            <hr className="border-slate-100 my-2" />

            <div className="flex justify-between items-center pt-1">
              <span className="text-base font-bold text-slate-900">
                Total Paid
              </span>
              <span className="text-2xl font-bold text-indigo-600">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="text-center pt-4">
          <Link to="/">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-2.5">
              Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmation;