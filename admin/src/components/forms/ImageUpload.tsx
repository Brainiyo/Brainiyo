import { useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  path: string;
}

export function ImageUpload({ label, value, onChange, path }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size too large (max 2MB)');
      return;
    }

    setIsUploading(true);
    setProgress(10);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      // Simulate progress for UI feel
      const progressInterval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 200);

      const { data, error } = await supabase.storage
        .from('brainiyo-assets')
        .upload(filePath, file);

      clearInterval(progressInterval);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('brainiyo-assets')
        .getPublicUrl(filePath);

      setProgress(100);
      setTimeout(() => {
        onChange(publicUrl);
        setIsUploading(false);
        setProgress(0);
      }, 500);
    } catch (error: any) {
      console.error(error);
      toast.error(`Supabase Upload failed: ${error.message}`);
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      
      {value ? (
        <div className="relative inline-block border rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <img src={value} alt="Uploaded" className="max-h-48 object-contain" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-slate-900/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className={cn(
          "relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer",
          isUploading ? "opacity-50 pointer-events-none" : ""
        )}>
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin" />
              <span className="text-sm font-bold">{Math.round(progress)}%</span>
            </div>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Click to upload image</span>
              <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 2MB</span>
            </>
          )}
          <input 
            type="file" 
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  );
}
