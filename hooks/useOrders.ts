import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { db } from '../services/firebase';
import { MOCK_ORDERS } from '../services/mockData';
import { withOrderIds, withProductIds, withUserIds } from '../utils/documents';

const resolveOrders = async (docs: any[]) => {
  return Promise.all(docs.map(async (docSnap) => {
    const data = docSnap.data();
    const orderId = docSnap.id;
    const order = withOrderIds(orderId, data as Record<string, unknown>) as any;

    // Fetch product details
    if (data.product_id) {
      try {
        const productDoc = await getDoc(doc(db, 'products', data.product_id));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          order.products = {
            id: productDoc.id,
            product_id: productDoc.id,
            ...productData
          };
          if (order.price === undefined && productData.price !== undefined) {
            order.price = productData.price;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch product for order:', data.product_id, e);
      }
    }

    // Fetch buyer details
    if (data.buyer_id) {
      try {
        const buyerDoc = await getDoc(doc(db, 'users', data.buyer_id));
        if (buyerDoc.exists()) {
          order.buyer = withUserIds(buyerDoc.id, buyerDoc.data() as Record<string, unknown>);
        }
      } catch (e) {
        console.warn('Failed to fetch buyer for order:', data.buyer_id, e);
      }
    }

    return order;
  }));
};

export function useOrders(userId?: string, role?: string) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // expose refetch by keeping a stable fetch function reference
  const fetchOrdersRef = useRef<null | (() => Promise<void>)>(null);

  useEffect(() => {
    if (!userId || !role) {
      setLoading(false);
      setOrders([]);
      return;
    }

    let active = true;
    
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let q = query(collection(db, 'orders'));
          
        if (role === 'buyer') {
          q = query(q, where('buyer_id', '==', userId));
        } else if (role === 'farmer') {
          q = query(q, where('farmer_id', '==', userId));
        }

        q = query(q, orderBy('order_date', 'desc'));

        const querySnapshot = await getDocs(q);
        let ordersData = await resolveOrders(querySnapshot.docs);

        // Fallback to mock orders if Firestore is empty (e.g., using mock profiles)
        if (ordersData.length === 0) {
          let mockOrders = MOCK_ORDERS.filter((o) => {
            if (role === 'buyer') return o.buyer_id === userId;
            if (role === 'farmer') return o.farmer_id === userId;
            return true;
          });
          // Show all mock orders if no exact match found
          if (mockOrders.length === 0 && MOCK_ORDERS.length > 0) {
            mockOrders = MOCK_ORDERS;
          }
          if (mockOrders.length > 0) {
            ordersData = mockOrders.map((o) => ({
              ...o,
              order_id: o.order_id,
            }));
          }
        }

        if (active) {
          setOrders(ordersData);
        }
      } catch (err: any) {
        console.error('Failed to fetch orders:', err);
        if (active) {
          setError(err.message || 'Failed to fetch orders');
          setOrders([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchOrdersRef.current = fetchOrders;

    fetchOrders();

    // Set up real-time listener
    let q = query(collection(db, 'orders'));
    if (role === 'buyer') {
      q = query(q, where('buyer_id', '==', userId));
    } else if (role === 'farmer') {
      q = query(q, where('farmer_id', '==', userId));
    }
    q = query(q, orderBy('order_date', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const ordersData = await resolveOrders(snapshot.docs);
      if (active) {
        setOrders(ordersData);
        setLoading(false);
      }
    }, (err) => {
      console.error('Real-time listener error:', err);
      if (active) {
        setError(err.message || 'Failed to fetch orders');
        setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
      fetchOrdersRef.current = null;
    };
  }, [userId, role]);

  const refetch = async () => {
    if (fetchOrdersRef.current) await fetchOrdersRef.current();
  };

  return { orders, loading, error, refetch };
}
