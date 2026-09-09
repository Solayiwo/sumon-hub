import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

const CART_STORAGE_KEY = "ecommerce_cart_items";

// Helper function to extract a string ID from any variations (id, product_id, _id)
const getNormalizedId = (itemOrId) => {
  if (!itemOrId) return "";
  if (typeof itemOrId === "object") {
    return String(itemOrId.product_id || itemOrId.id || itemOrId._id || "");
  }
  return String(itemOrId);
};

export const CartProvider = ({ children }) => {
  // Initialize state from localStorage (falls back to empty array)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      return [];
    }
  });

  // Sync cart items to localStorage on state update
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cartItems]);

  // Add item or increment quantity safely without state mutation
  const addToCart = (product) => {
    const targetId = getNormalizedId(product);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => getNormalizedId(item) === targetId
      );

      if (existingIndex > -1) {
        return prevItems.map((item, idx) =>
          idx === existingIndex
            ? {
                ...item,
                quantity: item.quantity + (product.quantity || 1),
              }
            : item
        );
      }

      // Ensure normalized key parameters exist on item stored in state
      return [
        ...prevItems,
        {
          ...product,
          id: targetId,
          product_id: targetId,
          quantity: product.quantity || 1,
        },
      ];
    });
  };

  // Update quantity directly
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const targetId = getNormalizedId(productId);

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        getNormalizedId(item) === targetId
          ? { ...item, quantity: Number(newQuantity) }
          : item
      )
    );
  };

  // Remove single item
  const removeFromCart = (productId) => {
    const targetId = getNormalizedId(productId);
    setCartItems((prevItems) =>
      prevItems.filter((item) => getNormalizedId(item) !== targetId)
    );
  };

  // Clear entire cart (for checkout completion)
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  // Check if item exists in cart
  const isInCart = (productId) => {
    const targetId = getNormalizedId(productId);
    return cartItems.some((item) => getNormalizedId(item) === targetId);
  };

  // Total item count for header badge
  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + (Number(item.quantity) || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isInCart,
        totalCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};