"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Tag, ShoppingBag, ShieldCheck, CheckCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { api } from "../api";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Food Processing");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(150);
  const [unit, setUnit] = useState("500g jar");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.listMarketplaceProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProduct = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.addProduct({
        name,
        category,
        description,
        price,
        unit,
        in_stock: true,
        stock_quantity: 25
      });
      setShowModal(false);
      setName("");
      setDescription("");
      loadProducts();
    } catch (err: any) {
      alert(err.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.deleteProduct(id);
      loadProducts();
    } catch (e: any) {
      alert(e.message || "Failed to delete product");
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/60 p-6 rounded-2xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Marketplace Catalog</span>
              <h1 className="text-2xl font-extrabold text-white">Products & Inventory Manager</h1>
              <p className="text-xs text-slate-400 mt-1">Manage your product offerings, set prices, and update stock status for customer orders.</p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">{p.category}</span>
                      <h3 className="font-bold text-white text-base leading-snug">{p.name}</h3>
                    </div>
                    <span className="text-base font-extrabold text-emerald-300">₹{p.price} <span className="text-xs font-normal text-slate-400">/{p.unit}</span></span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{p.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-700/60 text-xs">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> In Stock ({p.stock_quantity || 10})
                  </span>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="text-slate-400 hover:text-rose-400 p-1"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <h3 className="font-bold text-white text-lg">Add Product to Catalog</h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">&times;</button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Product Name:</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Handmade Mango Pickle"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Description:</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      placeholder="Brief product description..."
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Price (₹):</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Unit:</label>
                      <input
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="500g jar / piece"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddProduct}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg"
                  >
                    {loading ? "Saving..." : "Add Product"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
