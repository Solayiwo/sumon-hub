import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Truck,
  ShieldCheck,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  RotateCcw,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

const ProductDetails = ({ initialProduct, catalogProducts = [] }) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  const [fetchedCatalog, setFetchedCatalog] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [paramId]);

  const effectiveCatalog = useMemo(() => {
    return catalogProducts.length > 0 ? catalogProducts : fetchedCatalog;
  }, [catalogProducts, fetchedCatalog]);

  const getCleanId = (item) => {
    if (!item) return null;
    return String(item.product_id || item.id || item._id || "");
  };

  const findProductInList = (list, targetId) => {
    if (!targetId || !Array.isArray(list)) return null;
    return list.find((item) => getCleanId(item) === String(targetId));
  };

  const initialFound = useMemo(() => {
    if (initialProduct) return initialProduct;
    return findProductInList(effectiveCatalog, paramId);
  }, [initialProduct, effectiveCatalog, paramId]);

  const [product, setProduct] = useState(initialFound);
  const [loading, setLoading] = useState(!initialFound && Boolean(paramId));
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("specs");
  const [localQuantity, setLocalQuantity] = useState(1);

  const { cartItems = [], addToCart, removeFromCart, updateQuantity } = useCart();

  useEffect(() => {
    if (catalogProducts.length > 0) return;

    const controller = new AbortController();
    const fetchAllProducts = async () => {
      try {
        const res = await fetch("/api/products", { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.data || data.products || [];
          setFetchedCatalog(list);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch fallback catalog:", err);
        }
      }
    };

    fetchAllProducts();
    return () => controller.abort();
  }, [catalogProducts.length]);

  useEffect(() => {
    if (!paramId) return;

    const catalogMatch = findProductInList(effectiveCatalog, paramId);
    if (catalogMatch) {
      setProduct(catalogMatch);
      setLoading(false);
      setError(false);
      return;
    }

    const currentId = getCleanId(product);
    if (product && currentId === String(paramId)) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchProductData = async () => {
      setLoading(true);
      setError(false);

      try {
        const res = await fetch(`/api/products/${paramId}`, {
          signal: controller.signal,
        });
        const contentType = res.headers.get("content-type");

        if (!res.ok || !contentType || !contentType.includes("application/json")) {
          throw new Error("Target endpoint did not resolve to valid JSON.");
        }

        const data = await res.json();
        const fetchedProduct = data.data || data.product || data;

        if (fetchedProduct && getCleanId(fetchedProduct)) {
          setProduct(fetchedProduct);
        } else {
          setError(true);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("[ProductDetails Error]:", err.message);
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    return () => controller.abort();
  }, [paramId, effectiveCatalog]);

  const targetProductId = getCleanId(product);
  useEffect(() => {
    if (targetProductId) {
      setLocalQuantity(1);
    }
  }, [targetProductId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 max-w-7xl mx-auto space-y-8">
        <div className="h-4 bg-slate-100 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 aspect-square bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
          <div className="lg:col-span-5 space-y-5">
            <div className="h-8 bg-slate-100 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-slate-100 rounded w-1/4 animate-pulse" />
            <div className="h-28 bg-slate-100 rounded w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-red-50 text-red-600 rounded-full p-3 mb-4">
          <Trash2 className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-1">
          Product Unresolved
        </h2>
        <p className="text-slate-500 mb-6 text-xs max-w-sm leading-relaxed">
          The requested product could not be loaded.
        </p>
        <Link to="/">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 h-10">
            Return to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const productId = getCleanId(product);
  const cartItem = cartItems.find((item) => getCleanId(item) === productId);
  const isInCart = Boolean(cartItem);

  const currentQuantity = isInCart ? Number(cartItem.quantity) || 1 : localQuantity;
  const productStock = product.stock !== undefined ? Number(product.stock) : 99;

  const relatedProducts = effectiveCatalog
    .filter((item) => {
      const itemId = getCleanId(item);
      return itemId && itemId !== productId;
    })
    .slice(0, 4);

  const handleIncrement = () => {
    if (currentQuantity >= productStock) return;
    if (isInCart) {
      updateQuantity(productId, currentQuantity + 1);
    } else {
      setLocalQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (isInCart) {
      if (currentQuantity > 1) {
        updateQuantity(productId, currentQuantity - 1);
      }
    } else {
      setLocalQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    }
  };

  const handleCartToggle = () => {
    if (isInCart) {
      removeFromCart(productId);
    } else {
      addToCart({
        id: productId,
        product_id: productId,
        name: product.name,
        price: parseFloat(product.price || 0),
        image: product.image_url || product.image || "/placeholder-product.png",
        image_url: product.image_url || product.image || "/placeholder-product.png",
        quantity: localQuantity,
        stock: productStock,
      });
    }
  };

  // Buy Now direct trigger
  const handleBuyNow = () => {
    if (!isInCart) {
      addToCart({
        id: productId,
        product_id: productId,
        name: product.name,
        price: parseFloat(product.price || 0),
        image: product.image_url || product.image || "/placeholder-product.png",
        image_url: product.image_url || product.image || "/placeholder-product.png",
        quantity: localQuantity,
        stock: productStock,
      });
    }
    navigate("/checkout");
  };

  return (
    <main className="min-h-screen bg-white py-6 px-4 sm:px-6 lg:px-8 text-slate-900 antialiased">
      <div className="max-w-7xl mx-auto space-y-16">
        <nav className="text-[11px] text-slate-400 font-medium space-x-2">
          <Link to="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <span>›</span>
          <Link
            to={`/?category=${product.category_name || "all"}`}
            className="hover:text-indigo-600 transition-colors capitalize"
          >
            {product.category_name || "Catalog"}
          </Link>
          <span>›</span>
          <span className="text-slate-600 font-semibold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <div className="aspect-square bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-200/50 flex items-center justify-center p-4">
              <img
                src={product.image_url || product.image || "/placeholder-product.png"}
                alt={product.name}
                className="w-full h-full object-contain max-h-[80vh]"
                loading="eager"
              />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 lg:pl-4">
            <div className="space-y-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                  productStock > 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {productStock > 0 ? `In Stock (${productStock} left)` : "Out of Stock"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 pt-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current stroke-current" />
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Verified Product
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                ${Number(product.price || 0).toFixed(2)}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              {product.description || "No description provided for this product."}
            </p>

            <hr className="border-slate-100" />

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {productStock > 0 ? (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={currentQuantity <= 1}
                        aria-label="Decrease quantity"
                        className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800 select-none">
                        {currentQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={currentQuantity >= productStock}
                        aria-label="Increase quantity"
                        className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <Button
                      onClick={handleCartToggle}
                      className={`flex-1 text-xs font-bold py-3 h-auto tracking-wide text-white rounded-lg transition-all shadow-sm active:scale-[0.99] ${
                        isInCart
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {isInCart ? (
                        <>
                          <Trash2 className="h-4 w-4 mr-2 inline" /> REMOVE FROM CART
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4 mr-2 inline" /> ADD TO CART
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Dual Primary CTA: View Cart & Buy Now */}
                  <div className="grid grid-cols-2 gap-3">
                    {isInCart && (
                      <Button
                        onClick={() => navigate("/cart")}
                        variant="outline"
                        className="w-full text-xs font-bold py-3 h-auto border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        VIEW CART <ArrowRight className="h-4 w-4 ml-2 inline" />
                      </Button>
                    )}

                    <Button
                      onClick={handleBuyNow}
                      className={`text-xs font-bold py-3 h-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-sm ${
                        !isInCart ? "col-span-2" : "col-span-1"
                      }`}
                    >
                      <Zap className="h-4 w-4 mr-2 inline fill-current" /> BUY NOW
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  disabled
                  className="w-full text-xs font-bold py-3 h-auto bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed"
                >
                  OUT OF STOCK
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-slate-400" />
                <span>Express Transit</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <span>Authentic Warranty</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex border-b border-slate-200 gap-6 text-xs sm:text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("specs")}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === "specs"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Specifications
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("description")}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === "description"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Full Description
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("shipping")}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === "shipping"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Shipping & Returns
                </button>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed">
                {activeTab === "specs" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="font-medium text-slate-400">Category</span>
                      <span className="font-semibold text-slate-800 capitalize">
                        {product.category_name || product.category || "General"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="font-medium text-slate-400">Product Code</span>
                      <span className="font-semibold text-slate-800">SKU-{productId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="font-medium text-slate-400">Availability</span>
                      <span className="font-semibold text-slate-800">
                        {productStock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="font-medium text-slate-400">Warranty</span>
                      <span className="font-semibold text-slate-800">1 Year Limited</span>
                    </div>
                  </div>
                )}

                {activeTab === "description" && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <p>
                      {product.description ||
                        "Detailed technical breakdown and feature highlights are included with every standard purchase."}
                    </p>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <Truck className="h-4 w-4 text-indigo-600" /> Express Delivery Available
                    </div>
                    <p>
                      Standard deliveries arrive within 3-5 business days. Express shipping options can be selected at checkout.
                    </p>
                    <div className="flex items-center gap-2 font-semibold text-slate-800 pt-2">
                      <RotateCcw className="h-4 w-4 text-indigo-600" /> 30-Day Guarantee
                    </div>
                    <p>
                      If you are not fully satisfied, return it in original condition within 30 days.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="border-t border-slate-100 pt-10 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                You May Also Like
              </h2>
              <Link
                to="/"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View Catalog →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => {
                const itemId = getCleanId(item);
                const itemImage =
                  item.image_url || item.image || "/placeholder-product.png";

                return (
                  <div
                    key={itemId}
                    className="group border border-slate-200/80 hover:border-slate-300 bg-white rounded-xl overflow-hidden transition-all duration-200 flex flex-col justify-between"
                  >
                    <Link to={`/product/${itemId}`} className="p-4 block">
                      <div className="aspect-square bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center mb-3">
                        <img
                          src={itemImage}
                          alt={item.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm font-black text-slate-900 mt-1">
                        ${Number(item.price || 0).toFixed(2)}
                      </p>
                    </Link>
                    <div className="p-4 pt-0">
                      <Link to={`/product/${itemId}`}>
                        <Button
                          variant="outline"
                          className="w-full text-xs font-semibold h-8 text-slate-700 hover:bg-slate-50 border-slate-200"
                        >
                          View Item
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetails;