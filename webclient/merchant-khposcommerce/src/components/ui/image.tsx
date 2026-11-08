import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from 'react'
import { createPortal } from 'react-dom'
import {
  Eye,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Preview Group Context
// ─────────────────────────────────────────────────────────────────────────────

interface PreviewGroupContextType {
  previewUrls: string[]
  registerImage: (url: string) => void
  openPreview: (url: string) => void
}

const PreviewGroupContext = createContext<PreviewGroupContextType | null>(null)

export interface ImagePreviewGroupProps {
  items?: string[]
  children: React.ReactNode
}

export const ImagePreviewGroup: React.FC<ImagePreviewGroupProps> = ({
  items,
  children,
}) => {
  const [registeredUrls, setRegisteredUrls] = useState<string[]>([])
  const [activeUrl, setActiveUrl] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const previewUrls = items && items.length > 0 ? items : registeredUrls

  const registerImage = useCallback((url: string) => {
    if (!url) return
    setRegisteredUrls((prev) => (prev.includes(url) ? prev : [...prev, url]))
  }, [])

  const openPreview = useCallback((url: string) => {
    setActiveUrl(url)
    setIsOpen(true)
  }, [])

  return (
    <PreviewGroupContext.Provider
      value={{
        previewUrls,
        registerImage,
        openPreview,
      }}
    >
      {children}
      {isOpen && activeUrl && (
        <ImageLightboxModal
          key={activeUrl}
          isOpen={isOpen}
          initialUrl={activeUrl}
          images={previewUrls}
          onClose={() => setIsOpen(false)}
        />
      )}
    </PreviewGroupContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Lightbox Modal
// ─────────────────────────────────────────────────────────────────────────────

interface ImageLightboxModalProps {
  isOpen: boolean
  initialUrl: string
  images?: string[]
  alt?: string
  zIndex?: number
  onClose: () => void
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  initialUrl,
  images = [],
  alt = 'Preview',
  zIndex = 99999,
  onClose,
}) => {
  const allImages = images.length > 0 ? images : [initialUrl]
  const initialIndex = Math.max(0, allImages.indexOf(initialUrl))
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const currentImageUrl = allImages[currentIndex] || initialUrl

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((i) => (i > 0 ? i - 1 : allImages.length - 1))
        setZoom(1)
        setRotation(0)
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((i) => (i < allImages.length - 1 ? i + 1 : 0))
        setZoom(1)
        setRotation(0)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, allImages.length, onClose])

  if (!isOpen) return null

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5))
  const handleRotate = () => setRotation((r) => (r + 90) % 360)
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((i) => (i > 0 ? i - 1 : allImages.length - 1))
    setZoom(1)
    setRotation(0)
  }
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((i) => (i < allImages.length - 1 ? i + 1 : 0))
    setZoom(1)
    setRotation(0)
  }

  const handleDownload = () => {
    if (!currentImageUrl) return
    const link = document.createElement('a')
    link.href = currentImageUrl
    link.download = currentImageUrl.split('/').pop() || 'image'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return createPortal(
    <div
      style={{ zIndex }}
      className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Top Floating Toolbar */}
      <div
        className="absolute top-4 inset-x-0 mx-auto max-w-fit px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-700/60 shadow-2xl flex items-center gap-2 text-white z-50 backdrop-blur-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {allImages.length > 1 && (
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 mr-1">
            {currentIndex + 1} / {allImages.length}
          </span>
        )}

        <button
          type="button"
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={17} />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut size={17} />
        </button>
        <button
          type="button"
          onClick={handleRotate}
          className="p-1.5 rounded-lg hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Rotate"
        >
          <RotateCw size={17} />
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="p-1.5 rounded-lg hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Download"
        >
          <Download size={17} />
        </button>
        <a
          href={currentImageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Open Original"
        >
          <ExternalLink size={17} />
        </a>

        <div className="w-px h-4 bg-zinc-700/80 mx-1" />

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-300 hover:text-red-400 transition-colors cursor-pointer"
          title="Close (Esc)"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Arrows for Multiple Images */}
      {allImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/60 shadow-lg flex items-center justify-center transition-all cursor-pointer z-50 backdrop-blur-xs"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/60 shadow-lg flex items-center justify-center transition-all cursor-pointer z-50 backdrop-blur-xs"
            title="Next (Right Arrow)"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Image Container with Zoom & Rotate */}
      <div
        className="max-w-[90vw] max-h-[85vh] flex items-center justify-center p-2 transition-transform duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
        }}
      >
        <img
          src={currentImageUrl}
          alt={alt}
          className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl pointer-events-auto"
        />
      </div>
    </div>,
    document.body
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Image Component
// ─────────────────────────────────────────────────────────────────────────────

export interface ImagePreviewConfig {
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  mask?: React.ReactNode
  cover?: React.ReactNode
  zIndex?: number
}

export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null
  alt?: string
  fallback?: string
  fallbackSrc?: string
  className?: string
  rootClassName?: string
  preview?: boolean | ImagePreviewConfig
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

interface ImageComponentType extends React.ForwardRefExoticComponent<
  ImageProps & React.RefAttributes<HTMLImageElement>
> {
  PreviewGroup: typeof ImagePreviewGroup
}

const ImageInternal = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt = 'Image',
      fallback,
      fallbackSrc,
      className,
      rootClassName,
      preview = true,
      onError,
      onLoad,
      style,
      ...props
    },
    ref
  ) => {
    const fallbackImage = fallback || fallbackSrc
    const targetSrc = src || fallbackImage || ''

    const [prevSrc, setPrevSrc] = useState(targetSrc)
    const [currentSrc, setCurrentSrc] = useState(targetSrc)
    const [hasError, setHasError] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [lightboxOpen, setLightboxOpen] = useState(false)

    if (prevSrc !== targetSrc) {
      setPrevSrc(targetSrc)
      setCurrentSrc(targetSrc)
      setHasError(false)
      setIsLoaded(false)
    }

    const groupContext = useContext(PreviewGroupContext)

    useEffect(() => {
      if (src && groupContext) {
        groupContext.registerImage(src)
      }
    }, [src, groupContext])

    // Controlled preview visibility
    const isControlled = typeof preview === 'object' && typeof preview.visible === 'boolean'
    const isVisible = isControlled ? preview.visible : lightboxOpen

    const setVisible = (next: boolean) => {
      if (isControlled && preview && typeof preview === 'object' && preview.onVisibleChange) {
        preview.onVisibleChange(next)
      } else {
        setLightboxOpen(next)
      }
    }

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (!hasError && fallbackImage && currentSrc !== fallbackImage) {
        setHasError(true)
        setCurrentSrc(fallbackImage)
      }
      onError?.(e)
    }

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoaded(true)
      onLoad?.(e)
    }

    const handleClick = (e: React.MouseEvent) => {
      if (preview === false) return
      e.stopPropagation()
      if (groupContext && currentSrc) {
        groupContext.openPreview(currentSrc)
      } else {
        setVisible(true)
      }
    }

    const previewEnabled = preview !== false

    // Mask / hover overlay
    const renderMask = () => {
      if (!previewEnabled) return null
      if (typeof preview === 'object' && preview.mask === false) return null

      if (typeof preview === 'object' && preview.cover) {
        return (
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            {preview.cover}
          </div>
        )
      }

      if (typeof preview === 'object' && preview.mask) {
        return (
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            {preview.mask}
          </div>
        )
      }

      return (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-1.5 text-white text-xs font-semibold drop-shadow-md">
            <Eye size={15} />
            <span>Preview</span>
          </div>
        </div>
      )
    }

    return (
      <>
        <div
          className={cn(
            'relative overflow-hidden inline-flex items-center justify-center',
            previewEnabled && 'cursor-pointer group',
            rootClassName
          )}
          onClick={previewEnabled ? handleClick : undefined}
          style={style}
        >
          {/* Skeleton placeholder while loading */}
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 bg-muted/40 animate-pulse flex items-center justify-center pointer-events-none">
              <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
            </div>
          )}

          <img
            ref={ref}
            src={currentSrc}
            alt={alt}
            onError={handleError}
            onLoad={handleLoad}
            className={cn(
              'transition-opacity duration-200',
              !isLoaded && !hasError && 'opacity-0',
              className
            )}
            {...props}
          />

          {renderMask()}
        </div>

        {/* Lightbox when not inside a group context */}
        {!groupContext && isVisible && currentSrc && (
          <ImageLightboxModal
            key={currentSrc}
            isOpen={isVisible}
            initialUrl={currentSrc}
            alt={alt}
            zIndex={typeof preview === 'object' ? preview.zIndex : undefined}
            onClose={() => setVisible(false)}
          />
        )}
      </>
    )
  }
)

export const Image = Object.assign(ImageInternal, {
  PreviewGroup: ImagePreviewGroup,
}) as ImageComponentType

export default Image
