"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, ArrowLeft, Shield, Globe, 
  CheckCircle, AlertCircle, RefreshCw, X, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchCategories, fetchRegions, createRegion, updateRegion, deleteRegion,
  AWSRegionData, CategoryData 
} from '@/lib/api';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export default function ManageRegionsPage() {
  const [regions, setRegions] = useState<AWSRegionData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<AWSRegionData | null>(null);
  
  // Delete confirm states
  const [deletingRegion, setDeletingRegion] = useState<AWSRegionData | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Toast notifications
  const [toast, setToast] = useState<ToastState | null>(null);

  // Form inputs state
  const [formData, setFormData] = useState({
    awsRegionCode: '',
    name: '',
    regionCode: '',
    flag: '',
    latitude: 0,
    longitude: 0,
    categoryId: '',
    infrastructureDescription: '',
    availabilityZones: 3,
    launchYear: 2026,
    primaryLocation: '',
    compliance: '',
    totalServices: '200+',
    aimlServices: '30+',
    analyticsServices: '20+',
    networkingServices: '20+',
    edgeLocations: '10+',
    directConnect: 'Available',
    reach: 'Global',
    latency: 'Low',
    services: '',
    benefits: ''
  });

  const [formValidationErrors, setFormValidationErrors] = useState<{ field: string; message: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Load categories and regions from database
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [catsData, regsData] = await Promise.all([
        fetchCategories(),
        fetchRegions()
      ]);
      setCategories(catsData);
      setRegions(regsData);
      
      // Select first category by default for forms
      if (catsData.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: catsData[0].id }));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load database items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Prepopulate form for edit
  const handleEditClick = (region: AWSRegionData) => {
    // Find category ID matching region's category slug
    const matchingCat = categories.find(c => c.slug === region.categoryId);
    const categoryId = matchingCat ? matchingCat.id : (categories[0]?.id || '');

    setEditingRegion(region);
    setFormData({
      awsRegionCode: region.id,
      name: region.name,
      regionCode: region.code,
      flag: region.flag,
      latitude: region.lat,
      longitude: region.lng,
      categoryId,
      infrastructureDescription: region.infrastructure,
      availabilityZones: region.availabilityZones,
      launchYear: region.launchYear,
      primaryLocation: region.primaryLocation,
      compliance: region.compliance,
      totalServices: region.totalServices,
      aimlServices: region.aimlServices,
      analyticsServices: region.analyticsServices,
      networkingServices: region.networkingServices,
      edgeLocations: region.edgeLocations,
      directConnect: region.directConnect,
      reach: region.reach,
      latency: region.latency,
      services: region.services.join(', '),
      benefits: region.benefits.join(', ')
    });
    setFormValidationErrors([]);
    setIsFormOpen(true);
  };

  // Open empty form for add
  const handleAddClick = () => {
    setEditingRegion(null);
    setFormData({
      awsRegionCode: '',
      name: '',
      regionCode: '',
      flag: '',
      latitude: 0,
      longitude: 0,
      categoryId: categories[0]?.id || '',
      infrastructureDescription: '',
      availabilityZones: 3,
      launchYear: 2026,
      primaryLocation: '',
      compliance: '',
      totalServices: '200+',
      aimlServices: '30+',
      analyticsServices: '20+',
      networkingServices: '20+',
      edgeLocations: '10+',
      directConnect: 'Available',
      reach: 'Global',
      latency: 'Low',
      services: '',
      benefits: ''
    });
    setFormValidationErrors([]);
    setIsFormOpen(true);
  };

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' || name === 'availabilityZones' || name === 'launchYear'
        ? Number(value)
        : value
    }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormValidationErrors([]);

    // Format services/benefits arrays
    const payload = {
      ...formData,
      services: formData.services.split(',').map(s => s.trim()).filter(s => s !== ''),
      benefits: formData.benefits.split(',').map(b => b.trim()).filter(b => b !== '')
    };

    try {
      if (editingRegion) {
        await updateRegion(editingRegion.dbId, payload);
        showToast("AWS Region updated successfully", "success");
      } else {
        await createRegion(payload);
        showToast("New AWS Region created successfully", "success");
      }
      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Validation failed")) {
        // Backend validation errors - try to parse if structure matches
        try {
          // Check if we can parse custom error structures
          // Since our API client returns throw new Error(err.message || ...)
          // we should ensure it can be displayed
        } catch (e) {}
      }
      
      // Standardize extracting validation errors or displaying generic message
      showToast(err.message || "Failed to save region.", "error");
      
      // If error message is validation failures list, we can extract details
      // Simple parse of common backend conflict errors
      if (err.message && err.message.includes("already exists")) {
        setFormValidationErrors([{ field: 'awsRegionCode', message: err.message }]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger soft delete
  const handleDeleteClick = (region: AWSRegionData) => {
    setDeletingRegion(region);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingRegion) return;
    try {
      await deleteRegion(deletingRegion.dbId);
      showToast(`AWS Region ${deletingRegion.id} deleted successfully`, "success");
      setIsDeleteConfirmOpen(false);
      setDeletingRegion(null);
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to delete region", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1C1E] font-jakarta pb-16 relative overflow-x-hidden">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(190,227,237,0.1)_0%,transparent_50%)]" />
      </div>

      {/* COMPACT NAV BAR */}
      <nav className="w-full h-20 px-12 flex items-center justify-between border-b border-slate-100 bg-white/70 backdrop-blur-xl sticky top-0 left-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl border border-slate-200/80 flex items-center justify-center text-slate-800 shadow-sm text-lg backdrop-blur-md">
            🔧
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-slate-900 leading-none">Region Control Center</h2>
              <span className="text-[8px] font-black uppercase text-[#0073BB] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded tracking-wider">
                CORE DASHBOARD
              </span>
            </div>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">AWS Region Node Registry</p>
          </div>
        </div>

        {/* Back Link */}
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 shadow-sm flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer group transition-all duration-300 hover:shadow-md hover:border-slate-300 hover:text-slate-900"
        >
          <ArrowLeft size={12} className="transition-transform duration-300 group-hover:-translate-x-0.5" /> 
          <span>Back to Explorer</span>
        </Link>
      </nav>

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border animate-slide-up ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
            : 'bg-red-50 text-red-800 border-red-100'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-red-500" />}
          <p className="text-[12px] font-extrabold uppercase tracking-wider">{toast.message}</p>
        </div>
      )}

      {/* DASHBOARD CONTENT CONTAINER */}
      <main className="max-w-[1280px] mx-auto px-8 pt-12 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-[#1A1C1E] tracking-tight">Active Region Nodes</h1>
            <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase mt-2">Create, modify, and delete AWS presence mesh nodes</p>
          </div>

          <button
            onClick={handleAddClick}
            className="px-8 py-4 bg-[#1A1C1E] hover:bg-[#0073BB] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus size={16} /> Add Presense Node
          </button>
        </div>

        {/* LOADING / ERRORFallback STATES */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="animate-spin text-slate-400" size={32} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying registry database...</p>
          </div>
        )}

        {error && (
          <div className="py-20 text-center bg-white border border-slate-100 rounded-[2.5rem] p-10 max-w-xl mx-auto shadow-sm">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-slate-900 font-black text-xl mb-2">Sync Error</h3>
            <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6 uppercase tracking-wider">{error}</p>
            <button 
              onClick={loadData}
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* REGIONS GRID LIST */}
        {!loading && !error && regions.length === 0 && (
          <div className="py-24 text-center bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
            <Globe size={48} className="text-slate-200 mx-auto mb-6" />
            <h3 className="text-slate-900 font-black text-xl">Database Empty</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">No active presence nodes in this partition mesh</p>
          </div>
        )}

        {!loading && !error && regions.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50/50">
                    <th className="py-6 px-8">Flag</th>
                    <th className="py-6 px-6">Name</th>
                    <th className="py-6 px-6">AWS Region Code</th>
                    <th className="py-6 px-6">Category</th>
                    <th className="py-6 px-6">Coordinates</th>
                    <th className="py-6 px-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {regions.map((region) => (
                    <tr key={region.dbId} className="hover:bg-slate-50/50 transition-colors text-[13px] font-semibold text-slate-600">
                      <td className="py-6 px-8 text-2xl select-none">{region.flag}</td>
                      <td className="py-6 px-6 font-bold text-slate-900">{region.name}</td>
                      <td className="py-6 px-6">
                        <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md font-bold border border-slate-200/40">
                          {region.id}
                        </span>
                      </td>
                      <td className="py-6 px-6 font-extrabold text-[#0073BB] uppercase text-[11px] tracking-wider">
                        {region.category || "Unassigned"}
                      </td>
                      <td className="py-6 px-6 font-mono text-xs text-slate-400">
                        {region.lat.toFixed(4)}, {region.lng.toFixed(4)}
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(region)}
                            title="Edit specifications"
                            className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-950 hover:bg-slate-50 transition-all hover:shadow-sm"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(region)}
                            title="Decommission node"
                            className="p-2.5 rounded-xl border border-red-50 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all hover:shadow-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* REUSABLE FORM DRAWER PANEL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Dark overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
            />

            {/* Sliding Form Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white h-screen shadow-2xl flex flex-col z-10 border-l border-slate-100 overflow-hidden"
            >
              {/* Header */}
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingRegion ? `Edit ${editingRegion.id} Node` : 'Register Presense Node'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure database metrics</p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-950 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content (Scrollable) */}
              <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto premium-scrollbar px-10 py-8 flex flex-col gap-6 pb-24">
                
                {/* Error Summary */}
                {formValidationErrors.length > 0 && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs flex flex-col gap-2">
                    <p className="font-bold flex items-center gap-1"><AlertCircle size={14} /> Validation Constraints Violated:</p>
                    <ul className="list-disc pl-5 font-medium flex flex-col gap-0.5">
                      {formValidationErrors.map((err, i) => (
                        <li key={i}>{err.message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Standard Specs Divider */}
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] pb-2 border-b border-slate-50">Standard Presense Parameters</h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* AWS Region Code */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">AWS Region Code *</label>
                    <input
                      type="text"
                      name="awsRegionCode"
                      value={formData.awsRegionCode}
                      onChange={handleInputChange}
                      placeholder="e.g. us-east-1"
                      required
                      disabled={!!editingRegion}
                      className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all disabled:opacity-60"
                    />
                  </div>

                  {/* Region Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Display Name * (Max 80)</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. US East (N. Virginia)"
                      maxLength={80}
                      required
                      className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>

                  {/* Country Code */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Country Code * (e.g. US, CA)</label>
                    <input
                      type="text"
                      name="regionCode"
                      value={formData.regionCode}
                      onChange={handleInputChange}
                      placeholder="e.g. US"
                      required
                      className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>

                  {/* Flag Emoji */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Flag Emoji *</label>
                    <input
                      type="text"
                      name="flag"
                      value={formData.flag}
                      onChange={handleInputChange}
                      placeholder="e.g. 🇺🇸"
                      required
                      className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>

                  {/* Category select */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Presence Category *</label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                      className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.flag})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Latitude */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Latitude * (-90 to +90)</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder="e.g. 38.8048"
                      min={-90}
                      max={90}
                      required
                      className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>

                  {/* Longitude */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Longitude * (-180 to +180)</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder="e.g. -77.0469"
                      min={-180}
                      max={180}
                      required
                      className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Infrastructure specs */}
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] mt-4 pb-2 border-b border-slate-50">Infrastructure Specifications</h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Infrastructure Description (Max 250)</label>
                  <textarea
                    name="infrastructureDescription"
                    value={formData.infrastructureDescription}
                    onChange={handleInputChange}
                    placeholder="Brief description of regional data centers..."
                    maxLength={250}
                    rows={3}
                    className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Availability Zones */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Availability Zones</label>
                    <input
                      type="number"
                      name="availabilityZones"
                      value={formData.availabilityZones}
                      onChange={handleInputChange}
                      placeholder="e.g. 3"
                      min={1}
                      className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>

                  {/* Launch Year */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Launch Year</label>
                    <input
                      type="number"
                      name="launchYear"
                      value={formData.launchYear}
                      onChange={handleInputChange}
                      placeholder="e.g. 2016"
                      className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>

                  {/* Primary Location */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Primary Location (Max 80)</label>
                    <input
                      type="text"
                      name="primaryLocation"
                      value={formData.primaryLocation}
                      onChange={handleInputChange}
                      placeholder="e.g. Virginia, USA"
                      maxLength={80}
                      className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>

                  {/* Compliance */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Compliance Audits (Max 120)</label>
                    <input
                      type="text"
                      name="compliance"
                      value={formData.compliance}
                      onChange={handleInputChange}
                      placeholder="e.g. FedRAMP, HIPAA, SOC"
                      maxLength={120}
                      className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Service coverage */}
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] mt-4 pb-2 border-b border-slate-50">Regional Service Statistics</h4>

                <div className="grid grid-cols-4 gap-4">
                  {/* Total Services */}
                  <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Total Services</label>
                    <input
                      type="text"
                      name="totalServices"
                      value={formData.totalServices}
                      onChange={handleInputChange}
                      placeholder="e.g. 200+"
                      className="px-3 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>

                  {/* AI/ML Services */}
                  <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">AI/ML</label>
                    <input
                      type="text"
                      name="aimlServices"
                      value={formData.aimlServices}
                      onChange={handleInputChange}
                      placeholder="e.g. 30+"
                      className="px-3 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>

                  {/* Analytics Services */}
                  <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Analytics</label>
                    <input
                      type="text"
                      name="analyticsServices"
                      value={formData.analyticsServices}
                      onChange={handleInputChange}
                      placeholder="e.g. 20+"
                      className="px-3 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>

                  {/* Networking Services */}
                  <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Networking</label>
                    <input
                      type="text"
                      name="networkingServices"
                      value={formData.networkingServices}
                      onChange={handleInputChange}
                      placeholder="e.g. 20+"
                      className="px-3 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Connectivity */}
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] mt-4 pb-2 border-b border-slate-50">Global Connectivity Metric</h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Edge Locations */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Edge Locations</label>
                    <input
                      type="text"
                      name="edgeLocations"
                      value={formData.edgeLocations}
                      onChange={handleInputChange}
                      placeholder="e.g. 15+"
                      className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>

                  {/* Direct Connect */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Direct Connect</label>
                    <input
                      type="text"
                      name="directConnect"
                      value={formData.directConnect}
                      onChange={handleInputChange}
                      placeholder="e.g. Available / Supported"
                      className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>

                  {/* Reach */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Regional Reach (Max 120)</label>
                    <input
                      type="text"
                      name="reach"
                      value={formData.reach}
                      onChange={handleInputChange}
                      placeholder="e.g. Global / Americas"
                      maxLength={120}
                      className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>

                  {/* Latency */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Latency Profile (Max 120)</label>
                    <input
                      type="text"
                      name="latency"
                      value={formData.latency}
                      onChange={handleInputChange}
                      placeholder="e.g. Low latency across EU"
                      maxLength={120}
                      className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-bold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Sub-Items Arrays */}
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] mt-4 pb-2 border-b border-slate-50">Detailed Spec Lists</h4>

                {/* Services */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Core Services (Comma separated)</label>
                  <textarea
                    name="services"
                    value={formData.services}
                    onChange={handleInputChange}
                    placeholder="e.g. Amazon EC2, AWS Lambda, Amazon S3"
                    rows={2}
                    className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all resize-none"
                  />
                </div>

                {/* Benefits */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Key Benefits (Comma separated)</label>
                  <textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleInputChange}
                    placeholder="e.g. Sub-millisecond latency, Sovereign data hosting"
                    rows={2}
                    className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all resize-none"
                  />
                </div>

                {/* Bottom Spacer */}
                <div className="h-8" />
              </form>

              {/* Sticky bottom save bar */}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-end gap-3 z-20">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-4 border border-slate-200 text-slate-500 hover:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-4 bg-[#1A1C1E] hover:bg-[#0073BB] disabled:bg-slate-400 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="animate-spin" size={12} />}
                  <span>{editingRegion ? 'Save Changes' : 'Initialize Node'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE DIALOG MODAL */}
      <AnimatePresence>
        {isDeleteConfirmOpen && deletingRegion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
            />

            {/* Dialog panel */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border border-slate-100 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl z-10 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-100 animate-pulse">
                <Trash2 size={24} />
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Decommission AWS Node</h3>
              <p className="text-slate-500 text-xs font-bold leading-relaxed mb-8 uppercase tracking-wider">
                Are you sure you want to decommission presence node <span className="text-slate-950 font-black">{deletingRegion.id}</span>?<br />
                This action is reversible through database recovery but will hide the node from the explorer interface.
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 py-4 border border-slate-200 text-slate-500 hover:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-red-200"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
