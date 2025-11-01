/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";

interface PlaceDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website: string;
  photos: string[];
}

interface GooglePlacesAutocompleteProps {
  onPlaceSelected: (details: PlaceDetails) => void;
  apiKey: string;
}

// Global flag to track if script is loaded or loading
let isScriptLoaded = false;
let isScriptLoading = false;
const scriptLoadCallbacks: Array<() => void> = [];

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    // If already loaded, resolve immediately
    if (isScriptLoaded && window.google?.maps) {
      resolve();
      return;
    }

    // If currently loading, add to callback queue
    if (isScriptLoading) {
      scriptLoadCallbacks.push(() => resolve());
      return;
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com/maps/api/js"]`
    );
    
    if (existingScript) {
      isScriptLoaded = true;
      resolve();
      return;
    }

    // Start loading
    isScriptLoading = true;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      resolve();
      
      // Execute all queued callbacks
      scriptLoadCallbacks.forEach(cb => cb());
      scriptLoadCallbacks.length = 0;
    };

    script.onerror = () => {
      isScriptLoading = false;
      console.error("Failed to load Google Maps script");
    };

    document.head.appendChild(script);
  });
}

export function GooglePlacesAutocomplete({ onPlaceSelected, apiKey }: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(isScriptLoaded);

  useEffect(() => {
    if (!apiKey) return;

    loadGoogleMapsScript(apiKey).then(() => {
      setScriptReady(true);
    });
  }, [apiKey]);

  useEffect(() => {
    if (!scriptReady || !inputRef.current || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["establishment"],
      fields: [
        "name",
        "formatted_address",
        "address_components",
        "formatted_phone_number",
        "website",
        "photos",
      ],
    });

    autocomplete.addListener("place_changed", () => {
      setIsLoading(true);
      const place = autocomplete.getPlace();

      if (!place.address_components) {
        setIsLoading(false);
        return;
      }

      // Parse address components
      let street = "";
      let city = "";
      let state = "";
      let zipCode = "";

      place.address_components.forEach((component) => {
        const types = component.types;
        if (types.includes("street_number")) {
          street = component.long_name + " ";
        }
        if (types.includes("route")) {
          street += component.long_name;
        }
        if (types.includes("locality")) {
          city = component.long_name;
        }
        if (types.includes("administrative_area_level_1")) {
          state = component.short_name;
        }
        if (types.includes("postal_code")) {
          zipCode = component.long_name;
        }
      });

      // Get photos
      const photos: string[] = [];
      if (place.photos && place.photos.length > 0) {
        place.photos.slice(0, 5).forEach((photo) => {
          photos.push(photo.getUrl({ maxWidth: 800 }));
        });
      }

      const details: PlaceDetails = {
        name: place.name || "",
        address: street,
        city,
        state,
        zipCode,
        phone: place.formatted_phone_number || "",
        website: place.website || "",
        photos,
      };

      onPlaceSelected(details);
      setIsLoading(false);
    });
  }, [scriptReady, onPlaceSelected]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for a shop on Google..."
        disabled={isLoading || !apiKey}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {!apiKey && (
        <p className="text-sm text-red-500 mt-1">
          Google Places API key not configured. Please add manually.
        </p>
      )}
      {isLoading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}

