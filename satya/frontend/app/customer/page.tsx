"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Tag, ShieldCheck, ShoppingBag, Phone, Share2, Heart, Sparkles, AlertCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { api } from "../api";

export default function CustomerPortalPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Salem, Tamil Nadu");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const activePromos = await api.getActivePromotions().catch(() => []);
      setPromotions(activePromos);

      // Default featured search
      handleSearch("homemade pickles");
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setOrderSuccess(null);
    try {
      const res = await api.aiCustomerSearch(searchQuery, location);
      setResults(res);
    } catch (err: any) {
      alert(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (bizId: number) => {
    try {
      const res = await api.toggleSaveBusiness(bizId);
      setSavedIds(res.saved_business_ids || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    try {
      const res = await api.createOrder({
        business_profile_id: selectedProduct.business_id,
        order_type: "pickup",
        items: [{ product_id: selectedProduct.id, quantity: orderQuantity }],
        notes: "Placed via Customer Portal"
      });
      setOrderSuccess(res.message);
      setSelectedProduct(null);
    } catch (err: any) {
      alert(err.message || "Failed to place order request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-800 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Sparkles className="w-4 h-4" /> SATYA AI Natural Language Customer Portal
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Discover Rural Micro-Businesses Near You
              </h1>
              <p className="text-slate-300 max-w-2xl text-sm">
                Search in plain language e.g. <span className="text-emerald-300 font-medium">"Find homemade snacks near me"</span> or <span className="text-emerald-300 font-medium">"I need a tailor within 5 km"</span>.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Ask SATYA AI: e.g. 'homemade pickles', 'tailor near me', 'garam masala'..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="w-full md:w-64 relative">
                <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location (e.g. Salem, TN)"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
              >
                {loading ? "Searching..." : "AI Search"}
              </button>
            </div>

            {/* Natural language examples */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
              <span className="font-semibold text-slate-300">Try searching:</span>
              {[
                "Find homemade snacks near me",
                "Homemade pickles under ₹200",
                "Handcrafted pottery",
                "Tailoring services"
              ].map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setQuery(ex);
                    handleSearch(ex);
                  }}
                  className="px-2.5 py-1 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 rounded-full text-slate-300 hover:text-white transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Success Banner */}
          {orderSuccess && (
            <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-300 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>{orderSuccess}</span>
              </div>
              <button onClick={() => setOrderSuccess(null)} className="text-xs text-slate-400 hover:text-white">
                Dismiss
              </button>
            </div>
          )}

          {/* Sponsored Promotions Carousel / Grid */}
          {promotions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Sparkles className="w-4 h-4" /> Promoted & Sponsored Local Businesses
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="p-4 bg-gradient-to-br from-amber-950/20 via-slate-800/90 to-slate-800 border border-amber-500/30 rounded-xl space-y-2 relative"
                  >
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-full uppercase tracking-wider">
                      {promo.badge_label || "Sponsored"}
                    </span>
                    <h3 className="font-bold text-white text-base pr-20">{promo.headline}</h3>
                    <p className="text-xs text-slate-300">{promo.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs text-slate-400">
                      <span className="font-semibold text-emerald-400">{promo.business_name}</span>
                      <span>{promo.district}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Search Results Header & Non-hallucination Disclaimer */}
          {results && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Search Results ({results.total_results || 0})
                  </h2>
                  <p className="text-xs text-slate-400">{results.message}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{results.disclaimer}</span>
                </div>
              </div>

              {/* Products Section */}
              {results.products && results.products.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Available Products
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.products.map((prod: any) => (
                      <div
                        key={prod.id}
                        className="bg-slate-800/80 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all shadow-md"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                                {prod.category}
                              </span>
                              <h4 className="font-bold text-white text-base leading-snug">{prod.name}</h4>
                            </div>
                            <span className="text-base font-extrabold text-emerald-300">
                              ₹{prod.price} <span className="text-xs text-slate-400 font-normal">/ {prod.unit}</span>
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-2">{prod.description}</p>
                          <div className="text-xs text-slate-400 space-y-1 pt-1">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-slate-200">{prod.business_name}</span>
                              {prod.verification_status === "document_verified" && (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-slate-400">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{prod.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-700/60">
                          <button
                            onClick={() => setSelectedProduct(prod)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" /> Order / Request
                          </button>
                          {prod.share_code && (
                            <a
                              href={`/b/${prod.share_code}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs flex items-center gap-1"
                            >
                              <Share2 className="w-3.5 h-3.5" /> Card
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Businesses Section */}
              {results.businesses && results.businesses.length > 0 && (
                <div className="space-y-3 pt-4">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Registered Micro-Businesses
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.businesses.map((biz: any) => (
                      <div
                        key={biz.id}
                        className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                              {biz.business_category}
                            </span>
                            <h4 className="font-bold text-white text-base flex items-center gap-1.5">
                              {biz.business_name}
                              {biz.verification_status === "document_verified" && (
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              )}
                            </h4>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-500" /> {biz.location}
                            </p>
                          </div>
                          <button
                            onClick={() => handleToggleSave(biz.id)}
                            className="p-1.5 bg-slate-700/60 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-rose-400"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-300">{biz.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                          {biz.phone ? (
                            <a
                              href={`tel:${biz.phone}`}
                              className="text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" /> {biz.phone}
                            </a>
                          ) : (
                            <span className="text-slate-500">Contact via SATYA Chat</span>
                          )}
                          {biz.share_code && (
                            <a
                              href={`/b/${biz.share_code}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-teal-400 hover:underline flex items-center gap-1"
                            >
                              Digital Business Card &rarr;
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal for Order Request */}
          {selectedProduct && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <h3 className="font-bold text-white text-lg">Request Order</h3>
                  <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-white">
                    &times;
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                    {selectedProduct.category}
                  </div>
                  <h4 className="text-xl font-bold text-white">{selectedProduct.name}</h4>
                  <p className="text-sm text-slate-300">{selectedProduct.description}</p>
                  <div className="text-lg font-extrabold text-emerald-300">
                    ₹{selectedProduct.price} <span className="text-xs text-slate-400 font-normal">per {selectedProduct.unit}</span>
                  </div>
                  <div className="text-xs text-slate-400 pt-1">
                    Sold by: <span className="text-slate-200 font-semibold">{selectedProduct.business_name}</span> ({selectedProduct.location})
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-700">
                  <label className="text-xs font-semibold text-slate-300">Quantity ({selectedProduct.unit}):</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                      className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold text-lg"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold text-white w-8 text-center">{orderQuantity}</span>
                    <button
                      onClick={() => setOrderQuantity(orderQuantity + 1)}
                      className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right font-bold text-slate-200 text-sm">
                    Total Estimated Amount: <span className="text-emerald-400 font-extrabold text-base">₹{selectedProduct.price * orderQuantity}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg"
                  >
                    {loading ? "Submitting..." : "Send Order Request"}
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
