"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Check, X, Clock, MapPin, Phone } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { api } from "../api";

export default function OrdersManagerPage() {
  const [receivedOrders, setReceivedOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setReceivedOrders(data.received_orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      loadOrders();
    } catch (e: any) {
      alert(e.message || "Status update failed");
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-slate-800/80 border border-slate-700/60 p-6 rounded-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Marketplace Orders</span>
            <h1 className="text-2xl font-extrabold text-white">Received Customer Orders</h1>
            <p className="text-xs text-slate-400 mt-1">Review incoming order requests from local buyers, accept/reject orders, and track fulfillment.</p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading orders...</div>
          ) : receivedOrders.length === 0 ? (
            <div className="p-8 bg-slate-800/40 border border-slate-700/50 rounded-xl text-center space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-slate-400 text-sm">No customer orders received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedOrders.map((ord) => (
                <div key={ord.id} className="p-5 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order #{ord.id}</span>
                      <h3 className="font-bold text-white text-base">Amount: ₹{ord.total_amount}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-slate-700 text-emerald-300 text-xs font-bold rounded-full uppercase">
                        {ord.status}
                      </span>
                      <span className="px-2.5 py-1 bg-slate-900/80 text-slate-400 text-xs rounded-lg border border-slate-700">
                        {ord.order_type}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    {ord.delivery_address && (
                      <p className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Delivery Address: {ord.delivery_address}
                      </p>
                    )}
                    {ord.contact_phone && (
                      <p className="flex items-center gap-1.5 text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" /> Contact Phone: {ord.contact_phone}
                      </p>
                    )}
                    {ord.notes && <p className="text-slate-400 italic">Notes: {ord.notes}</p>}
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-700/60">
                    {ord.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(ord.id, "accepted")}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept Order
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ord.id, "rejected")}
                          className="px-4 py-2 bg-slate-700 hover:bg-rose-900/40 text-rose-300 font-semibold rounded-lg text-xs flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" /> Reject Order
                        </button>
                      </>
                    )}
                    {ord.status === "accepted" && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, "completed")}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
