import Image from "next/image";
import { getProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

export default async function Home() {
  // Fetch products without requiring authentication
  const { data: products } = await getProducts({ page: 1, limit: 10 });

  return (
    <div className="p-8">
      <main className="flex flex-col gap-[32px] items-center sm:items-start">
        <h1 className="text-2xl font-bold mb-4">Welcome to Flower Shop</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products?.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
