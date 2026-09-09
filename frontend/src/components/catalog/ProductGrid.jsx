import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import ProductCard from "./ProductCard";
import { getProducts } from "@/api/endpoints";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const categoriesList = [
  { id: "smartphones", label: "Smartphones & Tablets" },
  { id: "laptops", label: "Laptops & Computers" },
  { id: "gadgets", label: "Gadgets" },
  { id: "accessories", label: "Accessories" },
];

const ProductGrid = ({
  onAddToCart,
  priceRange = [0, 5000],
  onPriceChange,
  selectedBrands = [],
  selectedCategories = [], // Destructure the active category choices array prop
  onCategoryChange,       // Destructure callback parameter to map mobile sync updates
  onResetFilters,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 12;

  // Primary backend search string definitions
  const urlCategory = searchParams.get("category") || "";
  const q = searchParams.get("q") || "";

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        // Core structural database query fetching live repository items
        const response = await getProducts(urlCategory, q);
        setProducts(response.data || response);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [urlCategory, q]);

  // Combine parent layout props with current URL route tags
  const activeCategoriesArray = [...selectedCategories];
  if (urlCategory && !activeCategoriesArray.includes(urlCategory.toLowerCase())) {
    activeCategoriesArray.push(urlCategory.toLowerCase());
  }

  const handleCategoryToggle = (catId) => {
    // If the parent page container supplied a state hook callback, synchronize it
    if (onCategoryChange) {
      if (selectedCategories.includes(catId)) {
        onCategoryChange(selectedCategories.filter((c) => c !== catId));
      } else {
        onCategoryChange([...selectedCategories, catId]);
      }
    } else {
      // Direct deep-link route parameter fallback override
      if (urlCategory === catId) {
        searchParams.delete("category");
      } else {
        searchParams.set("category", catId);
      }
      setSearchParams(searchParams);
    }
  };

  const handleReset = () => {
    searchParams.delete("category");
    searchParams.delete("q");
    setSearchParams(searchParams);
    if (onResetFilters) onResetFilters();
  };

  const clientFilteredProducts = products.filter((product) => {
    const numericPrice = parseFloat(product.price || 0);
    const matchesPrice = numericPrice >= priceRange[0] && numericPrice <= priceRange[1];

    // FIX: Matches strictly by the database brand column property
    const matchesBrand =
      selectedBrands.length === 0 ||
      selectedBrands.some(
        (b) => (product.brand || "").toLowerCase() === b.toLowerCase()
      );

    const productCategory = (product.category_name || product.category || "").toLowerCase();
    const matchesCategory =
      activeCategoriesArray.length === 0 ||
      activeCategoriesArray.some((cat) => productCategory === cat.toLowerCase());

    return matchesPrice && matchesBrand && matchesCategory;
  });


  const sortedProducts = [...clientFilteredProducts].sort((a, b) => {
    const priceA = parseFloat(a.price || 0);
    const priceB = parseFloat(b.price || 0);
    if (sortBy === "price-low") return priceA - priceB;
    if (sortBy === "price-high") return priceB - priceA;
    return 0;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [urlCategory, q, priceRange, selectedBrands, selectedCategories, sortBy]);

  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm font-medium text-slate-500 animate-pulse">
        Loading products catalog...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(urlCategory || q) && (
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-indigo-950 capitalize">
            {q ? `Search Results for "${q}"` : `Category: ${urlCategory}`}
          </p>
          <span className="text-xs text-indigo-600 font-medium">{totalItems} items found</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border border-border">
        {/* Responsive Mobile Sheet Filters Menu view */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden gap-2 text-xs font-semibold">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeCategoriesArray.length > 0 && (
                <span className="ml-1 rounded-full bg-indigo-600 text-white w-4 h-4 flex items-center justify-center text-[10px]">
                  {activeCategoriesArray.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-left text-lg font-bold">Filters</SheetTitle>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Categories</h3>
                <div className="space-y-2.5">
                  {categoriesList.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mobile-cat-${cat.id}`}
                        checked={activeCategoriesArray.includes(cat.id)}
                        onCheckedChange={() => handleCategoryToggle(cat.id)}
                      />
                      <label htmlFor={`mobile-cat-${cat.id}`} className="text-sm font-medium text-slate-700 cursor-pointer">
                        {cat.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4" />

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Price Range</h3>
                <Slider
                  defaultValue={[0, 5000]}
                  max={5000}
                  step={50}
                  value={priceRange}
                  onValueChange={onPriceChange}
                  className="py-2"
                />
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>${priceRange[0]}</span>
                  <span>{priceRange[1] >= 5000 ? "$5,000+" : `$${priceRange[1]}`}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4" />

              <Button variant="secondary" className="w-full text-slate-600 bg-slate-100 text-xs font-semibold py-2" onClick={handleReset}>
                Reset All Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <p className="text-xs sm:text-sm font-medium text-slate-600">
          Showing <span className="font-bold text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="font-bold text-slate-900">{totalItems}</span> products
        </p>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px] sm:w-[160px] h-9 text-xs">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid rendering cards element */}
      {currentProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {currentProducts.map((product) => {
            const id = String(product.product_id || product.id);
            return (
              <ProductCard
                key={id}
                product={{
                  ...product,
                  id: id,
                  product_id: id,
                  name: product.name,
                  price: Number(product.price),
                  image: product.image_url || product.image,
                  category: product.category_name || product.category,
                  stock: product.stock,
                }}
                onAddToCart={onAddToCart}
              />
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-lg border border-border space-y-2">
          <h3 className="text-base font-semibold text-slate-900">No products found</h3>
          <p className="text-xs text-slate-500">Try adjusting or resetting your filter criteria.</p>
        </div>
      )}

      {/* Pagination Module controls bar */}
      {totalPages > 1 && (
        <Pagination className="pt-4 bg-white p-4 rounded-lg border border-border">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, index) => {
              const pageNum = index + 1;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === pageNum}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNum);
                    }}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination> 
      )}
    </div>
  );
};

export default ProductGrid;