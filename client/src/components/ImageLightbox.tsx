import { useState } from "react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageLightbox({ src, alt, className = "" }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`cursor-pointer ${className}`}
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 z-10"
              aria-label="Close"
            >
              ×
            </button>
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
