import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Please upload only image files",
            variant: "destructive"
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please upload images smaller than 5MB",
            variant: "destructive"
          });
          continue;
        }

        // Convert to base64 for now (in a real app, you'd upload to storage)
        const base64 = await fileToBase64(file);
        newPhotos.push(base64);
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removePhoto = (index: number) => {
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
                  JPG, PNG up to 5MB each
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