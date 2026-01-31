import { useEffect, useRef } from 'react'

const CELL_SIZE = 12 // Fixed cell size in pixels
const UPDATE_INTERVAL = 200 // Slow animation - update every 200ms

export default function GameOfLifeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const gridRef = useRef<boolean[][]>([])
  const generationRef = useRef(0)
  const gridWidthRef = useRef(0)
  const gridHeightRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Calculate grid dimensions based on viewport to fill entire screen
    const calculateGridSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      gridWidthRef.current = Math.ceil(width / CELL_SIZE)
      gridHeightRef.current = Math.ceil(height / CELL_SIZE)
    }

    // Initialize grid with random pattern
    const initializeGrid = (): boolean[][] => {
      const grid: boolean[][] = []
      for (let y = 0; y < gridHeightRef.current; y++) {
        grid[y] = []
        for (let x = 0; x < gridWidthRef.current; x++) {
          grid[y][x] = Math.random() < 0.50
        }
      }
      return grid
    }

    // Game of Life rules
    const countNeighbors = (grid: boolean[][], x: number, y: number): number => {
      let count = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && nx < gridWidthRef.current && ny >= 0 && ny < gridHeightRef.current) {
            if (grid[ny][nx]) count++
          }
        }
      }
      return count
    }

    const nextGeneration = (grid: boolean[][]): boolean[][] => {
      const newGrid: boolean[][] = []
      for (let y = 0; y < gridHeightRef.current; y++) {
        newGrid[y] = []
        for (let x = 0; x < gridWidthRef.current; x++) {
          const neighbors = countNeighbors(grid, x, y)
          const isAlive = grid[y][x]
          // Conway's rules
          if (isAlive) {
            newGrid[y][x] = neighbors === 2 || neighbors === 3
          } else {
            newGrid[y][x] = neighbors === 3
          }
        }
      }
      return newGrid
    }

    // Draw grid
    const drawGrid = (grid: boolean[][]) => {
      if (!canvas || !ctx) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Use primary orange color
      const primaryOrange = { r: 251, g: 146, b: 60 }
      
      // Draw cells with fixed square size
      for (let y = 0; y < gridHeightRef.current; y++) {
        for (let x = 0; x < gridWidthRef.current; x++) {
          if (grid[y][x]) {
            const neighbors = countNeighbors(grid, x, y)
            const opacity = Math.min(0.4, 0.30 + neighbors * 0.05)
            
            ctx.fillStyle = `rgba(${primaryOrange.r}, ${primaryOrange.g}, ${primaryOrange.b}, ${opacity})`
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1)
          }
        }
      }
    }

    // Set canvas size to fill viewport
    const updateCanvasSize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      calculateGridSize()
      gridRef.current = initializeGrid()
      drawGrid(gridRef.current)
    }
    
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    let lastUpdate = 0
    const update = (timestamp: number) => {
      if (timestamp - lastUpdate >= UPDATE_INTERVAL) {
        gridRef.current = nextGeneration(gridRef.current)
        drawGrid(gridRef.current)
        lastUpdate = timestamp
        generationRef.current++

        // Occasionally inject new random cells to keep it interesting
        if (generationRef.current % 50 === 0) {
          for (let i = 0; i < 8; i++) {
            const x = Math.floor(Math.random() * gridWidthRef.current)
            const y = Math.floor(Math.random() * gridHeightRef.current)
            gridRef.current[y][x] = true
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(update)
    }

    // Start animation
    animationFrameRef.current = requestAnimationFrame(update)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        width: '100vw',
        height: '100vh',
        opacity: 0.25,
      }}
      aria-hidden="true"
    />
  )
}
