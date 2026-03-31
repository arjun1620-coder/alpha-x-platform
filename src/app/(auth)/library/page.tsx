"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Box, Download, FileCode2, FileText, Upload, Database, Search } from "lucide-react";

// Mock Data
const MOCK_RESOURCES = [
  {
    id: "res-1",
    title: "ESP32 Custom Telemetry Script",
    description: "C++ script for reading MPU6050 data and sending logs to the central database over WiFi.",
    type: "snippet",
    date: "2026-03-31",
    size: "4 KB",
  },
  {
    id: "res-2",
    title: "Micro-Drone Chassis v2",
    description: "Reinforced 3D printable chassis optimized for resin SLA. Tested up to 2.5G acceleration.",
    type: "3d_model",
    date: "2026-03-25",
    size: "12 MB",
  },
  {
    id: "res-3",
    title: "Lidar Sensor Datasheet",
    description: "Official specs for the RPLIDAR A1M8 360 degree laser scanner.",
    type: "datasheet",
    date: "2026-03-10",
    size: "2.4 MB",
  },
  {
    id: "res-4",
    title: "Arduino Motor Driver Shield",
    description: "PCB Gerber files and Arduino wrapper library for the L298N high-current driver.",
    type: "snippet",
    date: "2026-02-14",
    size: "850 KB",
  },
  {
    id: "res-5",
    title: "6-Axis Robotic Arm Base",
    description: "Heavy-duty base mount and NEMA 17 stepper motor bracket STLs.",
    type: "3d_model",
    date: "2026-02-10",
    size: "45 MB",
  }
];

export default function ResourceLibrary() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = MOCK_RESOURCES.filter(res => {
    const matchesFilter = activeFilter === "all" || res.type === activeFilter;
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch(type) {
      case "snippet": return <FileCode2 className="w-8 h-8 text-teal-400" />;
      case "3d_model": return <Box className="w-8 h-8 text-purple-400" />;
      case "datasheet": return <FileText className="w-8 h-8 text-green-400" />;
      default: return <Database className="w-8 h-8 text-gray-400" />;
    }
  };

  const getBadgeClass = (type: string) => {
    switch(type) {
      case "snippet": return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case "3d_model": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "datasheet": return "bg-green-500/10 text-green-400 border-green-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getTypeName = (type: string) => {
    switch(type) {
      case "snippet": return "CODE SNIPPET";
      case "3d_model": return "3D MODEL (STL)";
      case "datasheet": return "DATASHEET (PDF)";
      default: return "RESOURCE";
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-emerald-500/30 overflow-hidden relative">
      <div className="flex h-screen">
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 md:p-12 relative z-10 w-full max-w-7xl mx-auto flex flex-col">
          
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors mb-8 font-medium self-start">
            <ArrowLeft className="w-4 h-4" />
            Back to Base
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 flex items-center gap-4">
                <Database className="w-10 h-10 text-emerald-500" />
                CENTRAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">LIBRARY</span>
              </h1>
              <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
                The private repository for internal members. Access, download, and share proprietary codebases, 3D printing assets, and hardware specs.
              </p>
            </div>

            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95 whitespace-nowrap">
              <Upload className="w-4 h-4" />
              Upload Resource
            </button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-10 w-full bg-white/[0.02] p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar gap-2 p-1">
              {['all', 'snippet', '3d_model', 'datasheet'].map(filter => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all whitespace-nowrap ${
                    activeFilter === filter 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {filter.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-full md:ml-auto md:max-w-xs">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Search database..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#030712] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {filteredResources.map(resource => (
              <div key={resource.id} className="bg-[#080d1a] border border-white/5 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] group flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                      {getIcon(resource.type)}
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase border rounded-full ${getBadgeClass(resource.type)}`}>
                      {getTypeName(resource.type)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-emerald-300 transition-colors">{resource.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                    {resource.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                  <div className="text-xs text-gray-500 font-medium">
                    {resource.size} • {resource.date}
                  </div>
                  <button className="p-2.5 rounded-xl bg-white/5 text-gray-300 border border-white/10 hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-all group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95" title="Download Resource">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredResources.length === 0 && (
              <div className="col-span-full border border-white/5 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center text-center bg-white/[0.02] backdrop-blur-sm py-32">
                <Search className="w-12 h-12 text-gray-700 mb-6" />
                <p className="text-2xl font-bold text-gray-300 mb-2">No components discovered</p>
                <p className="text-gray-500">Adjust your search parameters or select a different module category.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
