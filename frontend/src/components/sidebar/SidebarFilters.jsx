import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const SidebarFilters = ({
  selectedCategories = [],
  onCategoryChange,
  selectedBrands = [],
  onBrandChange,
  priceRange = [0, 5000],
  onPriceChange,
  onResetFilters,
}) => {
  const categoriesList = [
    { id: "smartphones", label: "Smartphones & Tablets" },
    { id: "laptops", label: "Laptops & Computers" },
    { id: "gadgets", label: "Gadgets" },
    { id: "accessories", label: "Accessories" },
  ];

  const brandsList = [
    { id: "apple", label: "Apple" },
    { id: "samsung", label: "Samsung" },
    { id: "sony", label: "Sony" },
    { id: "dell", label: "Dell" },
  ];

  const handleCategoryToggle = (catId) => {
    if (!onCategoryChange) return;
    
    // Normalize string vs array inputs
    const currentCats = Array.isArray(selectedCategories) 
      ? selectedCategories 
      : selectedCategories ? [selectedCategories] : [];

    if (currentCats.includes(catId)) {
      onCategoryChange(currentCats.filter((c) => c !== catId));
    } else {
      onCategoryChange([...currentCats, catId]);
    }
  };

  const handleBrandToggle = (brandId) => {
    if (!onBrandChange) return;
    if (selectedBrands.includes(brandId)) {
      onBrandChange(selectedBrands.filter((b) => b !== brandId));
    } else {
      onBrandChange([...selectedBrands, brandId]);
    }
  };

  const currentCategoriesArray = Array.isArray(selectedCategories)
    ? selectedCategories
    : selectedCategories ? [selectedCategories] : [];

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6 bg-white p-5 rounded-lg border border-slate-200 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      {/* Categories Filter */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Categories
        </h3>
        <div className="space-y-2.5">
          {categoriesList.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox
                id={`desktop-cat-${cat.id}`}
                checked={currentCategoriesArray.includes(cat.id)}
                onCheckedChange={() => handleCategoryToggle(cat.id)}
              />
              <label
                htmlFor={`desktop-cat-${cat.id}`}
                className="text-sm font-medium text-slate-700 cursor-pointer select-none"
              >
                {cat.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-0" />

      {/* Price Range Filter */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Price Range
        </h3>
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
          <span>
            {priceRange[1] >= 5000 ? "$5,000+" : `$${priceRange[1]}`}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-0" />

      {/* Brands Filter */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Brands
        </h3>
        <div className="space-y-2.5">
          {brandsList.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`desktop-brand-${brand.id}`}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={() => handleBrandToggle(brand.id)}
              />
              <label
                htmlFor={`desktop-brand-${brand.id}`}
                className="text-sm font-medium text-slate-700 cursor-pointer select-none"
              >
                {brand.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-2" />

      <Button
        variant="secondary"
        className="w-full text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs font-semibold py-2"
        onClick={onResetFilters}
      >
        Reset All Filters
      </Button>
    </aside>
  );
};

export default SidebarFilters;