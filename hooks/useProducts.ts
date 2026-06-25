
import { collection, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { db } from '../services/firebase';
import { MOCK_PRODUCTS } from '../services/mockData';
import { withProductIds } from '../utils/documents';

export function useProducts(farmerId?: string) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchRef = useRef<null | (() => Promise<void>)>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let q = query(collection(db, 'products'));
        
        if (farmerId) {
          q = query(q, where('farmer_id', '==', farmerId));
        } else {
          q = query(q, where('status', '==', 'active'));
        }

        q = query(q, orderBy('created_at', 'desc'));

        const querySnapshot = await getDocs(q);
        let productsData = querySnapshot.docs.map((d) =>
          withProductIds(d.id, d.data() as Record<string, unknown>)
        );

        // Fallback to mock products if Firestore is empty (e.g., using mock profiles)
        if (productsData.length === 0) {
          if (farmerId) {
            productsData = MOCK_PRODUCTS.filter((p) => p.farmer_id === farmerId).map((p: any) => ({
              ...p,
              id: p.product_id,
              product_id: p.product_id,
            }));
          } else {
            productsData = MOCK_PRODUCTS.filter((p) => p.status === 'active').map((p: any) => ({
              ...p,
              id: p.product_id,
              product_id: p.product_id,
            }));
          }
        }

        setProducts(productsData);
      } catch (err: any) {
        console.error('Failed to fetch products:', err);
        setError(err.message || 'Failed to fetch products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    fetchRef.current = fetchProducts;

    // Set up real-time listener
    let q = query(collection(db, 'products'));
    if (farmerId) {
      q = query(q, where('farmer_id', '==', farmerId));
    } else {
      q = query(q, where('status', '==', 'active'));
    }
    q = query(q, orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map((d) =>
        withProductIds(d.id, d.data() as Record<string, unknown>)
      );
      setProducts(productsData);
      setLoading(false);
    }, (err) => {
      console.error('Real-time listener error:', err);
      setError(err.message || 'Failed to fetch products');
      setLoading(false);
    });

    return () => {
      unsubscribe();
      fetchRef.current = null;
    };
  }, [farmerId]);

  const refetch = async () => {
    if (fetchRef.current) await fetchRef.current();
  };

  return { products, loading, error, refetch };
}

