const GRID_SIZE = 4
const CELL_SIZE = 12
const CELL_GAP = 2.5

const score = document.getElementById('score-saver')
const bestScore = document.getElementById('best-score')
//
localStorage.setItem('score', JSON.stringify({
  score: Number(0)
}))
score.innerText = JSON.parse(localStorage.getItem('score')).score

if(localStorage.getItem('bestScore') === null) {
  localStorage.setItem('bestScore', JSON.stringify({
    score: Number(0)
  }))
}
bestScore.innerText = JSON.parse(localStorage.getItem('bestScore')).score


export default class Grid {
  #cells
  constructor(gridElement) {
    gridElement.style.setProperty("--grid-size", GRID_SIZE)
    gridElement.style.setProperty("--cell-size", `${CELL_SIZE}vmin`)
    gridElement.style.setProperty("--cell-gap", `${CELL_GAP}vmin`)
    this.#cells = createCellElements(gridElement).map((cellElement, index) => {
      return new Cell(
        cellElement,
        index % GRID_SIZE,
        Math.floor(index / GRID_SIZE)
      )
    })
  }

  get cells() {
    return this.#cells
  }

  get cellsByRow() {
    return this.#cells.reduce((cellGrid, cell) => {
      cellGrid[cell.y] = cellGrid[cell.y] || []
      cellGrid[cell.y][cell.x] = cell
      return cellGrid
    }, [])
  }

  get cellsByColumn() {
    return this.#cells.reduce((cellGrid, cell) => {
      cellGrid[cell.x] = cellGrid[cell.x] || []
      cellGrid[cell.x][cell.y] = cell
      return cellGrid
    }, [])
  }

  get #emptyCells() {
    return this.#cells.filter(cell => cell.tile == null)
  }

  randomEmptyCell() {
    const randomIndex = Math.floor(Math.random() * this.#emptyCells.length)
    return this.#emptyCells[randomIndex]
  }
}

class Cell {
  #cellElement
  #x
  #y
  #tile
  #mergeTile

  constructor(cellElement, x, y) {
    this.#cellElement = cellElement
    this.#x = x
    this.#y = y
  }

  get x() {
    return this.#x
  }

  get y() {
    return this.#y
  }

  get tile() {
    return this.#tile
  }

  set tile(value) {
    this.#tile = value
    if (value == null) return
    this.#tile.x = this.#x
    this.#tile.y = this.#y
  }

  get mergeTile() {
    return this.#mergeTile
  }

  set mergeTile(value) {
    this.#mergeTile = value

    if (value == null) return
    this.#mergeTile.x = this.#x
    this.#mergeTile.y = this.#y
  }

  canAccept(tile) {
    return (
      this.tile == null ||
      (this.mergeTile == null && this.tile.value === tile.value)
    )
  }

  mergeTiles() {
    if (this.tile == null || this.mergeTile == null) return
    this.tile.value = this.tile.value + this.mergeTile.value

    localStorage.setItem('score', JSON.stringify({
      score: JSON.parse(localStorage.getItem('score')).score + this.tile.value
    }))
    score.innerText = JSON.parse(localStorage.getItem('score')).score

   if(JSON.parse(localStorage.getItem('score')).score >  JSON.parse(localStorage.getItem('bestScore')).score){
    localStorage.setItem('bestScore', JSON.stringify({
      score: JSON.parse(localStorage.getItem('score')).score
    }))
    bestScore.innerText = JSON.parse(localStorage.getItem('bestScore')).score
   }
    
    this.mergeTile.remove()
    this.mergeTile = null
  }

  remove(){
    if( this.tile){
      this.tile.remove()
      this.tile = null
    }
  }
}

function createCellElements(gridElement) {
  const cells = []
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const cell = document.createElement("div")
    cell.classList.add("cell")
    cells.push(cell)
    gridElement.append(cell)
  }
  return cells
}
