import { useState, useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { useCart } from "@context/CartContext";
import { useAuth } from "@context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();

  // Redirect to Auth page if user is not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    address1: "",
    address2: "",
    city: "",
    state: "New York",
    zipCode: "",
    shippingMethod: "standard",
  });

  // Keep form fields synced if user context updates after initial render
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || user.first_name || "",
        lastName: prev.lastName || user.last_name || "",
      }));
    }
  }, [user]);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0,
  );
  const shippingCost = formData.shippingMethod === "express" ? 14.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderPayload = {
      user_id: user?.user_id || 1,
      total_price: Number(total.toFixed(2)),
      order_date: new Date().toISOString(),
      status: "Pending",
      items: cartItems.map((item) => ({
        product_id: item.product_id || item.id,
        name: item.name,
        image: item.image || item.image_url || item.thumbnail,
        quantity: item.quantity || 1,
        unit_price: item.price,
      })),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (response.ok || data.order_id) {
        clearCart();
        navigate(`/order-confirmation/${data.order_id || Date.now()}`, {
          state: { order: data.order || orderPayload, shipping: formData },
        });
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      clearCart();
      navigate(`/order-confirmation/${Date.now()}`, {
        state: { order: orderPayload, shipping: formData },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50/50 py-12 px-4 text-center">
        <p className="text-slate-600 mb-4">Your cart is empty.</p>
        <Link to="/">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Return to Store
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Steps */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <Lock className="h-4 w-4" /> SECURE CHECKOUT
          </div>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
        >
          {/* Form Controls Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    First Name
                  </label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Last Name
                  </label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Address Line 1
                  </label>
                  <Input
                    name="address1"
                    value={formData.address1}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Address Line 2 (Optional)
                  </label>
                  <Input
                    name="address2"
                    value={formData.address2}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    City
                  </label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Zip Code
                  </label>
                  <Input
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Shipping Method */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                Shipping Method
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                    formData.shippingMethod === "standard"
                      ? "border-indigo-600 bg-indigo-50/30"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={formData.shippingMethod === "standard"}
                      onChange={handleInputChange}
                      className="accent-indigo-600"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        Standard Delivery
                      </p>
                      <p className="text-xs text-slate-500">
                        3-5 Business Days
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    FREE
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                    formData.shippingMethod === "express"
                      ? "border-indigo-600 bg-indigo-50/30"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={formData.shippingMethod === "express"}
                      onChange={handleInputChange}
                      className="accent-indigo-600"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        Express Shipping
                      </p>
                      <p className="text-xs text-slate-500">
                        1-2 Business Days
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    $14.99
                  </span>
                </label>
              </div>
            </section>

            {/* Payment Notice */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                Payment Options
              </h2>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                <p className="font-medium text-slate-800">
                  Simulated Payment Checkout
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  No live credit card processing required for this application.
                  Clicking &ldquo;Complete Order&rdquo; directly records your
                  order in the system.
                </p>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <div className="sticky top-20 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

            {/* Item list */}
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {cartItems.map((item) => (
                <div
                  key={item.id || item.product_id}
                  className="py-3 flex items-center gap-3 text-xs"
                >
                  <img
                    src={
                      item.image ||
                      item.image_url ||
                      item.thumbnail ||
                      "https://via.placeholder.com/150"
                    }
                    alt={item.name}
                    className="h-12 w-12 object-contain bg-slate-50 rounded border border-slate-100"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-slate-400">Qty: {item.quantity || 1}</p>
                  </div>
                  <span className="font-semibold text-slate-900">
                    ${(item.price * (item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-sm pt-4 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span className="text-indigo-600 text-lg">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 h-auto"
            >
              {isSubmitting ? "Processing Order..." : "Complete Order"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Checkout;
