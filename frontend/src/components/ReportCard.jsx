import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Trash2, Eye } from 'lucide-react';

export default function ReportCard({ laporan, onDelete, onViewDetail }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 500) + 100);
  const [viewCount] = useState(Math.floor(Math.random() * 5000) + 500);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}h lalu`;
    if (diffDays < 7) return `${diffDays}d lalu`;

    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aktif':
        return { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30', badge: 'bg-blue-500/10 text-blue-300' };
      case 'Selesai':
        return { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', badge: 'bg-green-500/10 text-green-300' };
      default:
        return { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30', badge: 'bg-amber-500/10 text-amber-300' };
    }
  };

  const statusColor = getStatusColor(laporan.status);

  return (
    <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`inline-block px-3 py-1.5 text-xs font-bold rounded-full ${statusColor.badge}`}>
          {laporan.status}
        </span>
      </div>

      {/* Image Container */}
      <div className="relative h-56 bg-linear-to-br from-slate-700 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-2">📦</div>
            <p className="text-slate-400 text-xs font-medium">{laporan.kategori_nama}</p>
          </div>
        </div>
        
        {/* Overlay Hover */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <button 
            onClick={() => onViewDetail?.(laporan)}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition transform hover:scale-105"
          >
            Lihat Detail
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {laporan.nama_pelapor?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{laporan.nama_pelapor}</p>
            <p className="text-slate-400 text-xs truncate">{laporan.lokasi_hilang}</p>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="text-white font-bold text-base mb-2 line-clamp-2">
            {laporan.nama_item} - {laporan.judul_laporan}
          </h3>
          {laporan.deskripsi && (
            <p className="text-slate-300 text-sm line-clamp-2">
              {laporan.deskripsi}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-200 ${
              isLiked 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
            }`}
            onClick={handleLike}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            <span className="text-xs font-semibold">{likeCount}</span>
          </button>
          
          <button 
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-700/50 transition-all duration-200"
            onClick={() => onViewDetail?.(laporan)}
          >
            <MessageCircle size={16} />
            <span className="text-xs font-semibold">Komentar</span>
          </button>

          <button 
            className="flex items-center justify-center p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-700/50 transition-all duration-200"
            title="Bagikan"
          >
            <Share2 size={16} />
          </button>

          <button 
            className="flex items-center justify-center p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-700/50 transition-all duration-200"
            title="Simpan"
          >
            <Bookmark size={16} />
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex gap-4 py-3 mb-4 border-y border-slate-700/50">
          <div className="flex items-center gap-1 text-slate-300 text-xs">
            <Eye size={14} className="text-slate-400" />
            <span>{viewCount.toLocaleString('id-ID')} views</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300 text-xs">
            <Heart size={14} className="text-slate-400" />
            <span>{likeCount.toLocaleString('id-ID')} suka</span>
          </div>
        </div>

        {/* Timestamp and Delete */}
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-xs font-medium">{formatDate(laporan.created_at)}</p>
          <button 
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all duration-200 text-xs font-semibold"
            onClick={() => {
              if (window.confirm('Yakin ingin menghapus laporan ini?')) {
                onDelete?.(laporan.id_laporan);
              }
            }}
          >
            <Trash2 size={14} />
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
