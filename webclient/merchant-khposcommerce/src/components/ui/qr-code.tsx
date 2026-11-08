import React, { useMemo, useEffect, useRef } from 'react'
import {
  QRCodeWriter,
  BarcodeFormat,
  EncodeHintType,
  QRCodeDecoderErrorCorrectionLevel,
} from '@zxing/library'
import { cn } from '@/lib/utils'

export interface QRCodeProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  size?: number
  color?: string
  bgColor?: string
  bordered?: boolean
  errorLevel?: 'L' | 'M' | 'Q' | 'H'
  type?: 'canvas' | 'svg'
  icon?: string
  iconSize?: number
  className?: string
  style?: React.CSSProperties
}

const ERROR_LEVEL_MAP: Record<'L' | 'M' | 'Q' | 'H', QRCodeDecoderErrorCorrectionLevel> = {
  L: QRCodeDecoderErrorCorrectionLevel.L,
  M: QRCodeDecoderErrorCorrectionLevel.M,
  Q: QRCodeDecoderErrorCorrectionLevel.Q,
  H: QRCodeDecoderErrorCorrectionLevel.H,
}

export const QRCode = React.forwardRef<HTMLDivElement, QRCodeProps>(
  (
    {
      value,
      size = 160,
      color = '#000000',
      bgColor = '#ffffff',
      bordered = true,
      errorLevel = 'M',
      type = 'canvas',
      icon,
      iconSize = 32,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    // Compute matrix once for given value and error level
    const matrixData = useMemo(() => {
      if (!value) return null
      try {
        const hints = new Map<EncodeHintType, any>()
        hints.set(EncodeHintType.MARGIN, 0)
        hints.set(
          EncodeHintType.ERROR_CORRECTION,
          ERROR_LEVEL_MAP[errorLevel] || QRCodeDecoderErrorCorrectionLevel.M
        )
        const writer = new QRCodeWriter()
        const matrix = writer.encode(value, BarcodeFormat.QR_CODE, 0, 0, hints)
        const width = matrix.getWidth()
        const height = matrix.getHeight()

        let path = ''
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (matrix.get(x, y)) {
              path += `M${x},${y}h1v1h-1z `
            }
          }
        }

        return {
          matrix,
          width,
          height,
          path,
        }
      } catch (err) {
        console.error('Failed to generate QR Code:', err)
        return null
      }
    }, [value, errorLevel])

    // Draw to canvas when type is 'canvas'
    useEffect(() => {
      if (type !== 'canvas' || !matrixData || !canvasRef.current) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const { matrix, width, height } = matrixData
      const scale = window.devicePixelRatio || 1
      canvas.width = size * scale
      canvas.height = size * scale
      ctx.scale(scale, scale)

      // Background
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, size, size)

      // Foreground dots
      ctx.fillStyle = color
      const cellW = size / width
      const cellH = size / height

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (matrix.get(x, y)) {
            ctx.fillRect(
              Math.floor(x * cellW),
              Math.floor(y * cellH),
              Math.ceil(cellW),
              Math.ceil(cellH)
            )
          }
        }
      }

      // Optional center icon on canvas
      if (icon) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const iconX = (size - iconSize) / 2
          const iconY = (size - iconSize) / 2
          ctx.fillStyle = bgColor
          ctx.fillRect(iconX - 2, iconY - 2, iconSize + 4, iconSize + 4)
          ctx.drawImage(img, iconX, iconY, iconSize, iconSize)
        }
        img.src = icon
      }
    }, [type, matrixData, size, color, bgColor, icon, iconSize])

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center select-none',
          bordered && 'p-2 rounded-xl border border-border/80 bg-white shadow-2xs',
          className
        )}
        style={{ width: bordered ? size + 16 : size, height: bordered ? size + 16 : size, ...style }}
        {...props}
      >
        {matrixData ? (
          type === 'canvas' ? (
            <canvas
              ref={canvasRef}
              style={{ width: size, height: size }}
              className="block"
            />
          ) : (
            <div className="relative" style={{ width: size, height: size }}>
              <svg
                viewBox={`0 0 ${matrixData.width} ${matrixData.height}`}
                width={size}
                height={size}
                className="block"
                style={{ backgroundColor: bgColor }}
              >
                <path d={matrixData.path} fill={color} />
              </svg>
              {icon && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <img
                    src={icon}
                    alt="QR Icon"
                    style={{ width: iconSize, height: iconSize }}
                    className="rounded-xs bg-white p-0.5 object-contain"
                  />
                </div>
              )}
            </div>
          )
        ) : (
          <div
            className="flex items-center justify-center bg-muted/40 text-muted-foreground text-xs font-mono"
            style={{ width: size, height: size }}
          >
            QR Error
          </div>
        )}
      </div>
    )
  }
)

QRCode.displayName = 'QRCode'

export default QRCode
