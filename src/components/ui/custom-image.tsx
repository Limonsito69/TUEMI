// src/components/ui/custom-image.tsx
'use client';

import * as React from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

export function CustomImage({ 
  src, 
  fallbackSrc = 'https://placehold.co/600x400?text=Sin+Imagen', 
  alt, 
  className, 
  ...props 
}: CustomImageProps) {
  const [imgError, setImgError] = React.useState(false);

  // Validamos inmediatamente si 'src' es válido (no es null, undefined ni string vacío)
  const isValidSrc = src && src.trim() !== '';

  // Si hay error de carga O el src inicial no es válido, mostramos el fallback
  if (imgError || !isValidSrc) {
    // Opción A: Mostrar imagen de fallback si existe
    if (fallbackSrc) {
      return (
        <Image
          src={fallbackSrc}
          alt={alt || "Imagen no disponible"}
          className={cn(className, "opacity-80 grayscale object-cover")}
          {...props}
          // Si incluso el fallback falla, no hacemos nada o podríamos mostrar el ícono
          onError={(e) => {
             // Evita bucles infinitos ocultando la imagen si el placeholder falla
             e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    
    // Opción B: Mostrar icono si no hay fallback
    return (
      <div className={cn("flex items-center justify-center bg-muted text-muted-foreground h-full w-full", className)}>
        <ImageOff className="h-8 w-8 opacity-50" />
      </div>
    );
  }

  // Si llegamos aquí, 'src' es válido (es un string no vacío)
  return (
    <Image
      src={src}
      alt={alt || "Imagen"}
      className={className}
      onError={() => setImgError(true)}
      {...props}
    />
  );
}