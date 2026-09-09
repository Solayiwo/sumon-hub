import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, Package, LogOut, UserCheck } from "lucide-react";
import { useCart } from "@context/CartContext";
import { useAuth } from "@context/AuthContext";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = ({ onSearch, onSelectCategory }) => {
  const { totalCartCount } = useCart();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper variables for logged-in state
  const firstName = user?.first_name || user?.firstName || "User";
  const lastName = user?.last_name || user?.lastName || "";
  const initials = `${firstName.charAt(0)}${
    lastName ? lastName.charAt(0) : ""
  }`.toUpperCase();

  // Deterministic Avatar Background Color
  const avatarColors = [
    "bg-indigo-600",
    "bg-violet-600",
    "bg-blue-600",
    "bg-emerald-600",
    "bg-rose-600",
    "bg-amber-600",
  ];
  const colorIndex =
    (firstName.charCodeAt(0) + (lastName ? lastName.charCodeAt(0) : 0)) %
    avatarColors.length;
  const avatarBg = avatarColors[colorIndex];

  // Route & Category mapping pointing to root store page
  const navigationItems = [
    { name: "Home", path: "/" },
    { name: "Smartphones", path: "/?category=smartphones" },
    { name: "Laptops", path: "/?category=laptops" },
    { name: "Gadgets", path: "/?category=gadgets" },
    { name: "Accessories", path: "/?category=accessories" },
  ];

  // Helper function to check if query navigation item is active
  const isItemActive = (itemPath) => {
    const currentFullPath = `${location.pathname}${location.search}`;
    if (itemPath === "/") {
      return location.pathname === "/" && !location.search;
    }
    return currentFullPath === itemPath;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      if (onSearch) onSearch(searchTerm);
      navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  const handleNavClick = (item) => {
    if (onSelectCategory) onSelectCategory(item.name);
    setSheetOpen(false); // Close mobile sheet on click
  };

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
    navigate("/auth");
  };

  return (
    <header className="w-full bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Left: Mobile Sheet Trigger & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Mobile Navigation Drawer */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle className="text-left font-bold text-xl text-indigo-900">
                    SuMon<span className="text-indigo-600">Hub</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-2 mt-6">
                  {navigationItems.map((item) => {
                    const active = isItemActive(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => handleNavClick(item)}
                        className={`px-3 py-2 text-sm rounded-md font-medium transition-colors ${
                          active
                            ? "bg-indigo-50 text-indigo-600 font-semibold"
                            : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link
              to="/"
              className="text-xl sm:text-2xl font-bold text-indigo-900 tracking-tight whitespace-nowrap"
            >
              SuMon<span className="text-indigo-600">Hub</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-1 lg:space-x-2">
              {navigationItems.map((item) => {
                const active = isItemActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => handleNavClick(item)}
                    className={`px-3 py-2 text-sm font-medium transition-colors duration-150 rounded-md ${
                      active
                        ? "text-indigo-600 border-b-2 border-indigo-600 rounded-none font-semibold"
                        : "text-muted-foreground hover:text-indigo-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search Bar & Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
            {/* Desktop / Tablet Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden sm:relative sm:flex w-full max-w-xs lg:max-w-sm"
            >
              <Input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 bg-slate-50 focus-visible:bg-white"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full text-muted-foreground hover:text-indigo-600"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {/* Mobile Search Icon Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="sm:hidden"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Action Buttons: Cart & User Account */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Shopping Cart Button */}
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="h-5 w-5 text-gray-700" />
                  {totalCartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-indigo-600 text-white rounded-full text-[10px]">
                      {totalCartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Dynamic User Profile / Auth Dropdown */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors text-left focus:outline-none">
                      <div
                        className={`h-9 w-9 rounded-full ${avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white shrink-0`}
                      >
                        {initials}
                      </div>
                      <div className="hidden xl:block min-w-0 pr-1">
                        <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                          {firstName} {lastName}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          Account & Orders
                        </p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold leading-none text-slate-900">
                            {firstName} {lastName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground truncate">
                            {user?.email || "Manage account"}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => navigate("/account")}
                      className="cursor-pointer gap-2"
                    >
                      <UserCheck className="h-4 w-4 text-slate-500" />
                      <span>My Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/account?tab=orders")}
                      className="cursor-pointer gap-2"
                    >
                      <Package className="h-4 w-4 text-slate-500" />
                      <span>My Orders</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 text-red-600" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => navigate("/auth")}>
                  <User className="h-5 w-5 text-gray-700" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Overlay */}
        {mobileSearchOpen && (
          <div className="sm:hidden pb-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 bg-slate-50"
                autoFocus
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full text-muted-foreground"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;