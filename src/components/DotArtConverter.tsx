import { useState, useRef, useEffect } from 'react'
import './DotArtConverter.css'

type ColorMode = 'color' | 'grayscale' | 'sepia' | 'inverted' | 'blackwhite'

const DotArtConverter: React.FC = () => {
  const [dotSize, setDotSize] = useState<number>(4)
  const [colorMode, setColorMode] = useState<ColorMode>('color')
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const dotCanvasRef = useRef<HTMLCanvasElement>(null)

  const processImage = () => {
    if (!image || !originalCanvasRef.current || !dotCanvasRef.current) return

    const originalCtx = originalCanvasRef.current.getContext('2d')
    const dotCtx = dotCanvasRef.current.getContext('2d')
    if (!originalCtx || !dotCtx) return

    originalCanvasRef.current.width = image.width
    originalCanvasRef.current.height = image.height
    dotCanvasRef.current.width = image.width
    dotCanvasRef.current.height = image.height

    originalCtx.drawImage(image, 0, 0)
    dotCtx.clearRect(0, 0, dotCanvasRef.current.width, dotCanvasRef.current.height)

    for (let y = 0; y < image.height; y += dotSize) {
      for (let x = 0; x < image.width; x += dotSize) {
        const pixelData = originalCtx.getImageData(x, y, 1, 1).data
        let r = pixelData[0]
        let g = pixelData[1]
        let b = pixelData[2]

        switch (colorMode) {
          case 'grayscale':
            const gray = (r + g + b) / 3
            r = g = b = gray
            break
          case 'sepia':
            r = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189))
            g = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168))
            b = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131))
            break
          case 'inverted':
            r = 255 - r
            g = 255 - g
            b = 255 - b
            break
          case 'blackwhite':
            const avg = (r + g + b) / 3
            r = g = b = avg > 127 ? 255 : 0
            break
        }

        dotCtx.fillStyle = `rgb(${r}, ${g}, ${b})`
        dotCtx.beginPath()
        dotCtx.arc(x + dotSize / 2, y + dotSize / 2, dotSize / 2, 0, 2 * Math.PI)
        dotCtx.fill()
      }
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setImage(img)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleDownload = () => {
    if (!dotCanvasRef.current) return
    const dataURL = dotCanvasRef.current.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataURL
    link.download = 'dot-art.png'
    link.click()
  }

  useEffect(() => {
    processImage()
  }, [image, dotSize, colorMode])

  return (
    <div className="converter">
      <div className="controls">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <label>Dot Size:</label>
        <input
          type="range"
          min="2"
          max="20"
          value={dotSize}
          onChange={(e) => setDotSize(parseInt(e.target.value))}
        />
        <label>Color Mode:</label>
        <select
          value={colorMode}
          onChange={(e) => setColorMode(e.target.value as ColorMode)}
        >
          <option value="color">Color</option>
          <option value="grayscale">Grayscale</option>
          <option value="sepia">Sepia</option>
          <option value="inverted">Inverted</option>
          <option value="blackwhite">Black & White</option>
        </select>
        <button onClick={handleDownload} disabled={!image}>
          Download Dot Art
        </button>
      </div>
      <canvas ref={originalCanvasRef} />
      <canvas ref={dotCanvasRef} />
    </div>
  )
}

export default DotArtConverter