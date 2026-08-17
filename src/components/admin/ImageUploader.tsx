import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { resizeImage, generateFileName, type ResizeOptions } from '@/lib/imageResize';
import { Button } from '@/components/ui/button';
import { Upload, Link, Loader2, X } from 'lucide-react';

interface ImageUploaderProps {
  bucket: 'product-images' | 'banners';
  resizeOptions: ResizeOptions;
  onUploaded: (url: string) => void;
  className?: string;
}

const ImageUploader = ({ bucket, resizeOptions, onUploaded, className }: ImageUploaderProps) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const resized = await resizeImage(file, resizeOptions);
      const path = generateFileName(bucket === 'product-images' ? 'products' : 'banners');
      const { error } = await supabase.storage.from(bucket).upload(path, resized, { contentType: 'image/jpeg' });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      setPreview(urlData.publicUrl);
      onUploaded(urlData.publicUrl);
    } catch (err: any) {
      console.error('Upload failed:', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    setPreview(urlInput.trim());
    onUploaded(urlInput.trim());
    setUrlInput('');
  };

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className={className}>
      {/* Tab switcher */}
      <div className="flex gap-1 mb-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${mode === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          <Upload className="h-3 w-3 inline mr-1" />Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${mode === 'url' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          <Link className="h-3 w-3 inline mr-1" />Paste URL
        </button>
      </div>

      {mode === 'upload' ? (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-border rounded-lg p-4 text-center text-sm text-muted-foreground hover:border-primary/50 transition-colors"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Resizing & uploading...</span>
            ) : (
              <span>Click to select image from PC or Google Drive</span>
            )}
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm"
          />
          <Button type="button" size="sm" onClick={handleUrlSubmit} className="bg-cta text-cta-foreground">Add</Button>
        </div>
      )}

      {preview && (
        <div className="relative mt-2 inline-block">
          <img src={preview} alt="Preview" className="h-20 rounded-md object-cover" />
          <button type="button" onClick={clearPreview} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
