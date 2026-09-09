import { useState } from "react";
import SidebarFilters from "@/components/sidebar/SidebarFilters";
import ProductGrid from "@/components/catalog/ProductGrid";


const Home = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 5000]);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6">
      {/* Sticky Desktop Sidebar */}
      <SidebarFilters
        selectedCategories={selectedCategories}
        onCategoryChange={setSelectedCategories}
        selectedBrands={selectedBrands}
        onBrandChange={setSelectedBrands}
        priceRange={priceRange}
        onPriceChange={setPriceRange}
        onResetFilters={handleResetFilters}
      />

      {/* Main Product Catalog */}
      <div className="flex-1 w-full">
        <ProductGrid
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
          selectedBrands={selectedBrands}
          onBrandChange={setSelectedBrands}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          onResetFilters={handleResetFilters}
        />
      </div>
    </div>
  );
};

export default Home;
