import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useReducer } from 'react';
import Layout from '../../components/Layout';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import AdminNav from '../../components/AdminNav';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, orders: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      state;
  }
}

export default function AdminOrderScreen() {
  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/orders`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, []);

  const deleteHandler = async (orderId) => {
    if (!window.confirm('Apakah Kamu yakin?')) {
      return;
    }
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/orders/${orderId}/deleteOrder`);
      dispatch({ type: 'DELETE_SUCCESS' });
      toast.success('Pesanan telah dihapus');
    } catch (err) {
      dispatch({ type: 'DELETE_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title="Admin Dashboard">
      <AdminNav>
        <h1 className="mb-4 text-xl">Admin Pesanan</h1>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="alert-error">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-5 text-left">ID</th>
                  <th className="p-5 text-left">Pengguna</th>
                  <th className="p-5 text-left">Tanggal</th>
                  <th className="p-5 text-left">Total</th>
                  <th className="p-5 text-left">Pembayaran</th>
                  <th className="p-5 text-left">Pengiriman</th>
                  <th className="p-5 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b">
                    <td className="p-5">{order._id.substring(20, 24)}</td>
                    <td className="p-5">{order.user ? order.user.name : 'Pengguna telah dihapus'}</td>
                    <td className="p-5">{order.createdAt.substring(0, 10)}</td>
                    <td className="p-5">Rp.{order.totalPrice}</td>
                    <td className="p-5">{order.isPaid ? `${order.paidAt.substring(0, 10)}` : 'Belum dibayar'}</td>
                    <td className="p-5">{order.isDelivered ? `${order.deliveredAt.substring(0, 10)}` : 'Pesanan sedang dikemas'}</td>
                    <td className="p-5 text-center">
                      <Link href={`/order/${order._id}`} passHref>
                        <div className="primary-button ">Detail</div>
                      </Link>
                      <button type="button" className="default-button w-full mt-2" onClick={() => deleteHandler(order._id)}>
                        Hapus Pesanan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminNav>
    </Layout>
  );
}

AdminOrderScreen.auth = { adminOnly: true };
