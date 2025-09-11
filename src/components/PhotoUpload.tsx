import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateImageFile } from '@/lib/validation';
import { supabase } from '@/integrations/supabase/client';

interface PhotoUploadProps {
  experienceId?: string;
  existingPhotos?: string[];
  onPhotosChange?: (photos: string[]) => void;
  maxPhotos?: number;
}

export const PhotoUpload = ({ 
  experienceId, 
  existingPhotos = [], 
  onPhotosChange,
  maxPhotos = 5 
}: PhotoUploadProps) => {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = maxPhotos - photos.length;
    if (files.length > remainingSlots) {
      toast({
        title: "Too many photos",
        description: `You can only upload ${remainingSlots} more photo(s)`,
        variant: "destructive"
      });
      return;
    }

    uploadFiles(Array.from(files));
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    try {
      const newPhotos: string[] = [];

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to upload photos",
          variant: "destructive"
        });
        return;
      }

      for (const file of files) {
        // Enhanced file validation
        const validation = validateImageFile(file);
        if (!validation.valid) {
          toast({
            title: "Invalid file",
            description: validation.error,
            variant: "destructive"
          });
          continue;
        }

        // Additional security: Check file header (magic bytes)
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Check for valid image magic bytes
        const isValidImage = 
          (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) || // JPEG
          (uint8Array[0] === 0x89 && uint8Array[1] === 0x50) || // PNG
          (uint8Array[0] === 0x52 && uint8Array[1] === 0x49); // WebP

        if (!isValidImage) {
          toast({
            title: "Invalid image file",
            description: "File appears to be corrupted or not a valid image",
            variant: "destructive"
          });
          continue;
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('experience-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive"
          });
          continue;
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('experience-photos')
          .getPublicUrl(uploadData.path);

        newPhotos.push(urlData.publicUrl);
      }

      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      onPhotosChange?.(updatedPhotos);

      toast({
        title: "Photos uploaded",
        description: `${newPhotos.length} photo(s) uploaded successfully`
      });

    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const extractStoragePathFromUrl = (url: string): string | null => {
    try {
      // Extract the file path from the storage URL
      const urlParts = url.split('/storage/v1/object/public/experience-photos/');
      return urlParts[1] || null;
    } catch {
      return null;
    }
  };

  const removePhoto = async (index: number) => {
    const photoUrl = photos[index];
    const storageUrl = extractStoragePathFromUrl(photoUrl);
    
    // Delete from Supabase Storage if it's a storage URL
    if (storageUrl) {
      const { error: deleteError } = await supabase.storage
        .from('experience-photos')
        .remove([storageUrl]);
        
      if (deleteError) {
        console.error('Error deleting from storage:', deleteError);
        toast({
          title: "Deletion failed",
          description: "Failed to delete photo from storage, but removed from list",
          variant: "destructive"
        });
      }
    }
    
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onPhotosChange?.(updatedPhotos);
  };

  const setPrimaryPhoto = (index: number) => {
    if (index === 0) return; // Already primary
    
    const updatedPhotos = [...photos];
    const [primaryPhoto] = updatedPhotos.splice(index, 1);
    updatedPhotos.unshift(primaryPhoto);
    
    setPhotos(updatedPhotos);
    onPhotosChange?.(updatedPhotos);

    toast({
      title: "Primary photo updated",
      description: "Photo moved to first position"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Experience Photos</h3>
        <Badge variant="outline">
          {photos.length}/{maxPhotos} photos
        </Badge>
      </div>

      {/* Upload Area */}
      {photos.length < maxPhotos && (
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Upload Photos</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add up to {maxPhotos} photos to showcase your experience
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Choose Files'}
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP up to 10MB each
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <Card key={index} className="overflow-hidden relative group">
              <div className="aspect-square relative">
                <img
                  src={photo}
                  alt={`Experience photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Primary badge */}
                {index === 0 && (
                  <Badge className="absolute top-2 left-2 text-xs">
                    Primary
                  </Badge>
                )}
                
                {/* Overlay controls */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index !== 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPrimaryPhoto(index)}
                      className="text-xs"
                    >
                      <ImageIcon className="w-3 h-3 mr-1" />
                      Set Primary
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <h4 className="font-medium mb-2">No photos yet</h4>
            <p className="text-sm text-muted-foreground">
              Add photos to make your experience more appealing to guests
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};