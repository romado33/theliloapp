import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
// @ts-ignore - No types available for this package
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MapProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  experiences?: Array<{
    id: string;
    title: string;
    latitude?: number;
    longitude?: number;
    location: string;
    price: number;
  }>;
  selectedRadius?: number;
  onRadiusChange?: (radius: number) => void;
  className?: string;
}

const Map: React.FC<MapProps> = ({
  onLocationSelect,
  experiences = [],
  selectedRadius = 25,
  onRadiusChange,
  className = ""
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get Mapbox token from Supabase secrets
    const getMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        
        const token = data?.token;
        if (token && token !== 'pk.your_mapbox_token_here') {
          setMapboxToken(token);
        } else {
          setMapboxToken('pk.your_mapbox_token_here');
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error getting Mapbox token:', error);
        setMapboxToken('pk.your_mapbox_token_here');
        setIsLoading(false);
      }
    };

    getMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || mapboxToken === 'pk.your_mapbox_token_here') return;

    // Set Mapbox access token
    mapboxgl.accessToken = mapboxToken;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-75.6919, 45.4215], // Ottawa coordinates
      zoom: 10,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geocoder for search
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxToken,
      mapboxgl: mapboxgl,
      placeholder: 'Search for a location...',
      bbox: [-76.3532, 45.2489, -75.2469, 45.5375], // Ottawa area bounds
      proximity: { longitude: -75.6919, latitude: 45.4215 },
    });

    map.current.addControl(geocoder, 'top-left');

    // Handle geocoder result
    geocoder.on('result', (e: any) => {
      const { center, place_name } = e.result;
      onLocationSelect?.({
        lat: center[1],
        lng: center[0],
        address: place_name,
      });
      setUserLocation({ lat: center[1], lng: center[0] });
    });

    // Add click handler for location selection
    map.current.on('click', (e) => {
      const { lat, lng } = e.lngLat;
      
      // Reverse geocoding to get address
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`)
        .then(response => response.json())
        .then(data => {
          const address = data.features[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          onLocationSelect?.({ lat, lng, address });
          setUserLocation({ lat, lng });
        })
        .catch(() => {
          onLocationSelect?.({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
          setUserLocation({ lat, lng });
        });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, onLocationSelect]);

  // Add experience markers
  useEffect(() => {
    if (!map.current || !experiences.length) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.experience-marker');
    existingMarkers.forEach(marker => marker.remove());

    experiences.forEach((experience) => {
      if (experience.latitude && experience.longitude) {
        const el = document.createElement('div');
        el.className = 'experience-marker';
        el.style.cssText = `
          background-color: hsl(var(--primary));
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">${experience.title}</h3>
            <p class="text-xs text-gray-600">${experience.location}</p>
            <p class="text-xs font-medium">$${experience.price}</p>
          </div>
        `);

        new mapboxgl.Marker(el)
          .setLngLat([experience.longitude, experience.latitude])
          .setPopup(popup)
          .addTo(map.current!);
      }
    });
  }, [experiences]);

  // Add radius circle
  useEffect(() => {
    if (!map.current || !userLocation) return;

    const radiusInKm = selectedRadius;
    const radiusInMeters = radiusInKm * 1000;
    
    // Remove existing radius circle
    if (map.current.getSource('radius')) {
      map.current.removeLayer('radius-fill');
      map.current.removeLayer('radius-stroke');
      map.current.removeSource('radius');
    }

    // Create circle
    const circle = {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [userLocation.lng, userLocation.lat],
      },
      properties: {
        radius: radiusInMeters,
      },
    };

    map.current.addSource('radius', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [circle],
      },
    });

    map.current.addLayer({
      id: 'radius-fill',
      type: 'circle',
      source: 'radius',
      paint: {
        'circle-radius': {
          stops: [
            [0, 0],
            [20, radiusInKm * 1000 / Math.pow(2, 20 - map.current.getZoom())],
          ],
          base: 2,
        },
        'circle-color': 'hsl(var(--primary))',
        'circle-opacity': 0.1,
      },
    });

    map.current.addLayer({
      id: 'radius-stroke',
      type: 'circle',
      source: 'radius',
      paint: {
        'circle-radius': {
          stops: [
            [0, 0],
            [20, radiusInKm * 1000 / Math.pow(2, 20 - map.current.getZoom())],
          ],
          base: 2,
        },
        'circle-color': 'hsl(var(--primary))',
        'circle-opacity': 0.3,
        'circle-stroke-width': 2,
        'circle-stroke-color': 'hsl(var(--primary))',
      },
    });
  }, [userLocation, selectedRadius]);

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (mapboxToken === 'pk.your_mapbox_token_here' || !mapboxToken) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Mapbox Token Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              To use the map feature, you need to add your Mapbox public token to Supabase secrets.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                1. Go to <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a> and get your public token
              </p>
              <p className="text-xs text-muted-foreground">
                2. Add it to your Supabase project secrets as "MAPBOX_PUBLIC_TOKEN"
              </p>
            </div>
            <Button 
              onClick={() => window.open('https://supabase.com/dashboard/project/baigglncdwirfwlxagcl/settings/functions', '_blank')}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Open Supabase Secrets
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="space-y-4">
        {/* Radius Control */}
        {userLocation && (
          <div className="p-4 border-b flex items-center gap-4">
            <label className="text-sm font-medium">Search radius:</label>
            <Input
              type="number"
              value={selectedRadius}
              onChange={(e) => onRadiusChange?.(Number(e.target.value))}
              min="1"
              max="100"
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">km</span>
          </div>
        )}
        
        {/* Map Container */}
        <div ref={mapContainer} className="h-96 w-full rounded-lg" />
        
        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground">
            Click on the map or use the search box to select a location
          </p>
        </div>
      </div>
    </Card>
  );
};

export default Map;