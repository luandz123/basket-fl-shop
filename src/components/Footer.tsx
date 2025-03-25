import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-medium text-lg mb-4">Flower Shop</h3>
            <p className="text-gray-600">
              Beautiful flowers for every occasion.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-600 hover:text-primary transition">Home</Link></li>
              <li><Link href="/products" className="text-gray-600 hover:text-primary transition">Products</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-primary transition">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Contact Us</h3>
            <address className="text-gray-600 not-italic">
              <p>123 Flower Street</p>
              <p>City, Country</p>
              <p className="mt-2">Email: info@flowershop.com</p>
              <p>Phone: (123) 456-7890</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Flower Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;