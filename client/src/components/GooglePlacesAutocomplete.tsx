/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
// Input component not needed - using native input

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

export function GooglePlacesAutocomplete({ onPlaceSelected, apiKey }: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!apiKey || scriptLoaded) return;

    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey, scriptLoaded]);

  useEffect(() => {
    if (!scriptLoaded || !inputRef.current || !window.google) return;

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
  }, [scriptLoaded, onPlaceSelected]);

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

