import Image from "next/image";
import { getProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import styles from "./page.module.css";

export default async function Home() {
  // Lấy sản phẩm mà không cần xác thực
  const { data: products } = await getProducts({ page: 1, limit: 10 });

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Chào mừng đến với Cửa hàng Hoa</h1>
        <div className={styles.grid}>
          {products?.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
