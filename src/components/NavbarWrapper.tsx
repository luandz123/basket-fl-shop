'use client';

import { useEffect, useState } from 'react';
import Navbar from './Navbar';

// Simple static placeholder that exactly matches initial client render
const NavbarPlaceholder = () => (
  <div className="bg-gray-800 p-4 text-white">
    <div className="container mx-auto flex justify-between items-center">
      <div className="text-xl font-bold">Flower Shop</div>
      <div className="space-x-4">
        <span>Products</span>
        <span>Login</span>
        <span>Register</span>
      </div>
    </div>
  </div>
);

export default function NavbarWrapper() {
  // Use useState with a callback to avoid hydration mismatches
  const [mounted, setMounted] = useState(false);
  
  // Only run effect on the client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Render placeholder until client-side hydration is complete
  if (!mounted) {
    return <NavbarPlaceholder />;
  }
  
  return <Navbar />;
}
