import { Link } from "react-router-dom";

// Shadcn UI Components
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const shopLinks = [
    { name: "Smartphones", href: "/?category=smartphones" },
    { name: "Laptops", href: "/?category=laptops" },
    { name: "Gadgets", href: "/?category=gadgets" },
    { name: "Accessories", href: "/?category=accessories" },
  ];

  const supportLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Shipping Info", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Help Center", href: "#" },
  ];

  const companyLinks = [
    { name: "About Us", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Contact", href: "#" },
  ];

  return (
    <footer className="w-full bg-slate-50 border-t border-border text-slate-600 mt-16">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info (Spans 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            <a
              href="/"
              className="text-2xl font-bold text-indigo-900 tracking-tight block"
            >
              SuMon<span className="text-indigo-600">Hub</span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Elevating the e-commerce experience through precision, quality,
              and exceptional service.
            </p>
            
          </div>

          {/* Shop Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Shop
            </h3>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom Bar: Copyright & Payment Icons */}
      <div className="bg-slate-100/60 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} SuMon Hub E-commerce. All rights reserved.</p>

          {/* Payment Badges Placeholder */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-500">
              VISA
            </span>
            <span className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-500">
              MASTERCARD
            </span>
            <span className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-500">
              PAYSTACK
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
