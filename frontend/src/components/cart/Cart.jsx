import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Info,
  ShieldCheck,
  CreditCard,
  Lock,
} from "lucide-react";
import { useCart } from "@context/CartContext";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [promoCode, setPromoCode] = useState("");

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0,
  );
  const tax = subtotal * 0.08; // 8% estimated tax
  const total = subtotal + tax;

  return (
    <main className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Your Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <p className="text-slate-500 text-base">
              Your cart is currently empty.
            </p>
            <Link to="/">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Section: Scrollable Cart Items Container */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              {/* Header */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white z-10">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Price</div>
              </div>

              {/* Scrollable Product List */}
              <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto custom-scrollbar">
                {cartItems.map((item) => {
                  const qty = Number(item.quantity) || 1;
                  const itemId = item.id || item._id;
                  const productUrl = `/product/${itemId}`;

                  return (
                    <div
                      key={itemId}
                      className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Item Details (Clickable Image and Title) */}
                      <div className="sm:col-span-6 flex items-center gap-4">
                        <Link
                          to={productUrl}
                          className="h-20 w-20 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center p-2 group hover:border-indigo-300 transition-colors"
                        >
                          <img
                            src={item.image || "/placeholder-product.png"}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                          />
                        </Link>
                        <div className="space-y-1">
                          <Link
                            to={productUrl}
                            className="font-semibold text-slate-900 text-base leading-tight hover:text-indigo-600 transition-colors block"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-slate-400">
                            {item.color || item.variant || "Standard"} |{" "}
                            {item.type || item.category || "Wireless"}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="sm:col-span-3 flex items-center justify-start sm:justify-center">
                        <div className="flex items-center border border-slate-200 rounded-md bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(itemId, qty - 1)}
                            disabled={qty <= 1}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-slate-800 select-none">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(itemId, qty + 1)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Price & Remove Button */}
                      <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-4">
                        <span className="font-bold text-slate-900 text-base">
                          ${(item.price * qty).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(itemId)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping Footer */}
              <div className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-100 mt-auto">
                <Link
                  to="/"
                  className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right Section: Sticky Order Summary */}
            <div className="sticky top-20 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-medium text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between text-slate-600 items-center">
                  <span className="flex items-center gap-1">
                    Tax <Info className="h-3.5 w-3.5 text-slate-400" />
                  </span>
                  <span className="font-medium text-slate-900">
                    ${tax.toFixed(2)}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-indigo-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link to="/checkout" className="w-full block">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 h-auto flex items-center justify-center gap-2">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              {/* Promo Code Box */}
              <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200/60 space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="bg-white text-sm"
                  />
                  <Button
                    variant="outline"
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Secure Payment Notice */}
              <div className="text-center pt-2 space-y-2">
                <p className="text-xs text-slate-400">Secure payments via</p>
                <div className="flex items-center justify-center gap-3 text-slate-400">
                  <CreditCard className="h-5 w-5" />
                  <ShieldCheck className="h-5 w-5" />
                  <Lock className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;
