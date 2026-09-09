import { Link } from "react-router-dom";
import { Star, ShoppingBag, Check, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ProductCard = ({ product }) => {
  const { addToCart, removeFromCart, isInCart } = useCart();

  const {
    id,
    name,
    category,
    brand,
    price,
    originalPrice,
    rating,
    reviewsCount,
    image,
    isNew,
    stock,
    inStock: explicitInStock,
  } = product;

  // Convert stock count string/number into an active boolean check
  const stockCount = Number(stock ?? 0);
  const isAvailable = explicitInStock !== undefined ? Boolean(explicitInStock) : stockCount > 0;

  const itemInCart = isInCart(id);

  const handleCartToggle = () => {
    if (itemInCart) {
      removeFromCart(id);
    } else {
      addToCart(product);
    }
  };

  return (
    <div className="group relative bg-white border border-border rounded-lg overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
      <div>
        {/* Top Image Container & Badges */}
        <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
            {isNew && (
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase font-bold px-2 py-0.5">
                New
              </Badge>
            )}
            {originalPrice && originalPrice > price && (
              <Badge
                variant="destructive"
                className="text-[10px] font-bold px-2 py-0.5"
              >
                -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2.5 right-2.5 z-10 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm text-slate-600 hover:text-red-500 hover:bg-white shadow-sm"
          >
            <Heart className="h-4 w-4" />
            <span className="sr-only">Add to Wishlist</span>
          </Button>

          <Link
            to={`/product/${id}`}
            className="w-full h-full flex items-center justify-center"
          >
            <img
              src={image || "/placeholder-product.png"}
              alt={name}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>

        {/* Product Meta & Details */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium uppercase tracking-wider">
            <span>{brand}</span>
            <span>{category}</span>
          </div>

          <Link to={`/product/${id}`}>
            <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 hover:text-indigo-600 transition-colors">
              {name}
            </h3>
          </Link>

          <div className="flex items-center gap-1">
            <div className="flex items-center text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-semibold text-slate-700 ml-1">
                {rating ? Number(rating).toFixed(1) : "0.0"}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              ({reviewsCount || 0})
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Add / Remove Cart Action */}
      <div className="p-4 pt-0 mt-auto border-t border-slate-50 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-slate-900">
              ${Number(price)?.toLocaleString()}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-slate-400 line-through">
                ${Number(originalPrice).toLocaleString()}
              </span>
            )}
          </div>
          {!isAvailable && (
            <span className="text-[10px] font-semibold text-red-500">
              Out of Stock
            </span>
          )}
        </div>

        <Button
          size="sm"
          disabled={!isAvailable}
          onClick={handleCartToggle}
          className={`font-medium text-xs gap-1.5 transition-colors ${
            itemInCart
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {itemInCart ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Added
            </>
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5" />
              Add
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;