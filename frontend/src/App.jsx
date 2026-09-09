import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CartProvider } from "@context/CartContext"; 
import { AuthProvider } from "@context/AuthContext"; 

import {
  HomeLayout,
  Home,
  CartPage,
  ProductDetailsPage,
  CheckoutPage,
  OrderconfirmationPage,
  Auth,
  Account,
  NotFound,
} from "./pages";
import "@styles/App.css";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomeLayout />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "/cart",
          element: <CartPage />,
        },
        {
          path: "product/:id",
          element: <ProductDetailsPage />,
        },
        {
          path: "/checkout",
          element: <CheckoutPage />,
        },
        {
          path: "/order-confirmation/:orderId",
          element: <OrderconfirmationPage />,
        },
        {
          path: "/account",
          element: <Account />,
        },
      ],
    },

    {
      path: "/auth",
      element: <Auth />,
    },

    {
      path: "*",
      element: <NotFound />,
    }
  ]);

  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
