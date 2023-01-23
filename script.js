import Grid from "./Grid.js"
import Tile from "./Tile.js"

const gameBoard = document.getElementById("game-board")

const grid = new Grid(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
setupInput()



function setupInput() {

  window.addEventListener("keydown", function (e) {
    handleInput(e.key)
  }, { once: true })

  window.addEventListener('touchstart', function (event) {
    touchstartX = event.changedTouches[0].screenX;
    touchstartY = event.changedTouches[0].screenY;
  }, { once: true })

  window.addEventListener('touchend', function (event) {
    touchendX = event.changedTouches[0].screenX;
    touchendY = event.changedTouches[0].screenY;
    handleGesture();
  }, { once: true })
}

let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;

function handleGesture() {
  let xDiff = touchstartX - touchendX;
  let yDiff = touchstartY - touchendY;
  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    if (xDiff > 0) {
      handleInput("ArrowLeft")
    } else {
      handleInput("ArrowRight")
    }
  } else {
    if (yDiff > 0) {
      handleInput("ArrowUp")
    } else {
      handleInput("ArrowDown")
    }
  }
}

async function handleInput(key) {
  switch (key) {
    case "ArrowUp":
      if (!canMoveUp()) {
        setupInput()
        return
      }
      await moveUp()
      break
    case "ArrowDown":
      if (!canMoveDown()) {
        setupInput()
        return
      }
      await moveDown()
      break
    case "ArrowLeft":
      if (!canMoveLeft()) {
        setupInput()
        return
      }
      await moveLeft()
      break
    case "ArrowRight":
      if (!canMoveRight()) {
        setupInput()
        return
      }
      await moveRight()
      break
    default:
      setupInput()
      return
  }

  grid.cells.forEach(cell => cell.mergeTiles())
  const newTile = new Tile(gameBoard)
  grid.randomEmptyCell().tile = newTile

  
  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    gameBoard.style.backgroundImage = "url('img/game-over.gif')"
    gameBoard.style.marginTop = "20px"
    
    const cells = document.querySelectorAll(".cell")
    for(let i = 0 ; i < cells.length;i++ ) cells[i].style.display= "none"
    
    const tiles = document.querySelectorAll(".tile")
    for(let i = 0 ; i < tiles.length;i++ ) tiles[i].style.display= "none"
    return
  }
  setupInput()
}

function moveUp() {
  return slideTiles(grid.cellsByColumn)
}

function moveDown() {
  return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft() {
  return slideTiles(grid.cellsByRow)
}

function moveRight() {
  return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}

function slideTiles(cells) {
  return Promise.all(
    cells.flatMap(group => {
      const promises = []
      for (let i = 1; i < group.length; i++) {
        const cell = group[i]
        if (cell.tile == null) continue
        let lastValidCell
        for (let j = i - 1; j >= 0; j--) {
          const moveToCell = group[j]
          if (!moveToCell.canAccept(cell.tile)) break
          lastValidCell = moveToCell
        }

        if (lastValidCell != null) {
          promises.push(cell.tile.waitForTransition())
          if (lastValidCell.tile != null) {
            lastValidCell.mergeTile = cell.tile
          } else {
            lastValidCell.tile = cell.tile
          }
          cell.tile = null
        }
      }
      return promises
    })
  )
}

function canMoveUp() {
  return canMove(grid.cellsByColumn)
}

function canMoveDown() {
  return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
  return canMove(grid.cellsByRow)
}

function canMoveRight() {
  return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}

function canMove(cells) {
  return cells.some(group => {
    return group.some((cell, index) => {
      if (index === 0) return false
      if (cell.tile == null) return false
      const moveToCell = group[index - 1]
      return moveToCell.canAccept(cell.tile)
    })
  })
}


document.getElementById('btn-new-game').addEventListener('click', () => {
  gameBoard.style.backgroundImage = "none"
  gameBoard.style.marginTop = "0px"

  const cells = document.querySelectorAll(".cell")
  for(let i = 0 ; i < cells.length;i++ ) cells[i].style.display= "block"


  grid.cells.forEach(cell => cell.remove())
  grid.randomEmptyCell().tile = new Tile(gameBoard)
  grid.randomEmptyCell().tile = new Tile(gameBoard)

  localStorage.setItem('score', JSON.stringify({
    score: Number(0)
  }))
  document.getElementById('score-saver').innerText = JSON.parse(localStorage.getItem('score')).score

  setupInput()
})
