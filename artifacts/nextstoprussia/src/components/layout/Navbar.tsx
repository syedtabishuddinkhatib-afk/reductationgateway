import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, Phone, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Universities", href: "#universities" },
    { name: "Fees", href: "#fees" },
    { name: "Admission", href: "#process" },
    { name: "Gallery", href: "#gallery" },
    { name: "Testimonials", href: "#testimonials" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md py-3"
          : "bg-white py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-2 rounded-lg group-hover:bg-primary/90 transition-colors">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-primary tracking-tight">
              NextStop<span className="text-accent">Russia</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
            <div className="flex items-center space-x-4 border-l pl-6 border-border">
              <a
                href="https://wa.me/+79000000000"
                target="_blank"
                rel="noreferrer"
                className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp
              </a>
              <Button asChild className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                <a href="#contact">Apply Now</a>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-foreground hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-border shadow-xl animate-in slide-in-from-top-2">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-3 text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 mt-2 border-t border-border flex flex-col gap-3">
              <a
                href="https://wa.me/+79000000000"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-full px-4 py-3 text-base font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
              >
                <Phone className="w-5 h-5 mr-2" />
                Talk on WhatsApp
              </a>
              <Button asChild className="w-full rounded-lg py-6 text-lg">
                <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Apply Now</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
