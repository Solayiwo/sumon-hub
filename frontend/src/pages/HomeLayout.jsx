import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@components/header/header";
import Footer from "@components/footer/Footer";


function HomeLayout() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Header stays sticky at top */}
        
      <Header cartCount={cartCount} />

      {/* Main content area expands to push footer to the bottom */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet context={{ cartCount, setCartCount }} />
      </main>

      {/* Footer stays at bottom */}
      <Footer />
    </div>
  );
}

export default HomeLayout;
