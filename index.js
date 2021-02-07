const bodyParser = require('body-parser')
const express = require('express')

const PORT = process.env.PORT || 3000

const app = express()
app.use(bodyParser.json())

app.get('/', handleIndex)
app.post('/start', handleStart)
app.post('/move', handleMove)
app.post('/end', handleEnd)

app.listen(PORT, () => console.log(`Battlesnake Server listening at http://127.0.0.1:${PORT}`))

var grideSize
var grid = []
var toClear = false


function handleIndex(request, response) {
  var battlesnakeInfo = {
    apiversion: '1',
    author: 'WAWH',
    color: '#000000',
    head: 'bonhomme',
    tail: 'flake'
  }
  response.status(200).json(battlesnakeInfo)
}

function handleStart(request, response) {
  var gameData = request.body
  grideSize = gameData.board.height
  
  for (var i=0; i<grideSize; i++) {
    grid[i] = []
    for (var j=0; j<grideSize; j++) {
      grid[i][j] = 'Empty'
    }
  }

  console.log('START')
  response.status(200).send('ok')
}

function handleMove(request, response) {
  var gameData = request.body

  var move
  var health = gameData.you.health
  var falseUp = false
  var falseRight = false
  var falseDown = false
  var falseLeft = false
  var midY = Math.floor(gameData.board.height / 2)
  var midX = Math.floor(gameData.board.width / 2)

  // console.log('Mid: ' + midX + ' , ' + midY)

  // Restrict movement towards wall
  if(gameData.you.head.y === gameData.board.height - 1) {falseUp = true}
  if(gameData.you.head.x === gameData.board.width - 1) {falseRight = true}
  if(gameData.you.head.y === 0) {falseDown = true}
  if(gameData.you.head.x === 0) {falseLeft = true}

  // Avoid body
  for (i in gameData.you.body) {
    if (gameData.you.head.y + 1 === gameData.you.body[i].y && 
          gameData.you.head.x === gameData.you.body[i].x) {
      falseUp = true
    }
    if (gameData.you.head.x + 1 === gameData.you.body[i].x &&
          gameData.you.head.y === gameData.you.body[i].y) {
      falseRight = true
    }
    if (gameData.you.head.y - 1 === gameData.you.body[i].y &&
          gameData.you.head.x === gameData.you.body[i].x) {
      falseDown = true
    }
    if (gameData.you.head.x - 1 === gameData.you.body[i].x &&
          gameData.you.head.y === gameData.you.body[i].y) {
      falseLeft = true
    }
  }

  console.log('\nfalseUp: ' + falseUp)
  console.log('falseRight: ' + falseRight)
  console.log('falseDown: ' + falseDown)
  console.log('falseLeft: ' + falseLeft + '\n')

  if (health <= grideSize) {
    console.log("HUNGRY")
    
  }
  else {
    // Move to corner
    if(gameData.you.head.x < midX && falseLeft === false) {
      move = 'left'
    }
    else if (gameData.you.head.x > midX && falseRight === false) {
      move = 'right'
    }
    else if (gameData.you.head.y > midY && falseUp === false) {
      move = 'up'
    }
    else if (gameData.you.head.y < midY && falseDown === false) {
      move = 'down'
    }
    else {
      if(gameData.you.head.y === midY && falseUp === false) {
        move = 'up'
      }
      else if(gameData.you.head.y === midY && falseDown === false) {
        move = 'down'
      }
      else if(gameData.you.head.x === midX && falseLeft === false) {
        move = 'left'
      }
      else if(gameData.you.head.x === midX && falseRight === false) {
        move = 'right'
      }
      else {
        if (gameData.you.head.x === gameData.you.head.y) {
          if (gameData.you.head.x !== 0) {
            if (falseDown === false) {
              move = 'down'
            }
            else if (falseLeft === false) {
              move = 'left'
            }
          }
          else {
            if (falseUp === false) {
              move = 'up'
            }
            else if (falseRight === false) {
              move = 'right'
            }
          }
          console.log('X == Y ' + move)
        }
        else {
          if (gameData.you.head.x < gameData.you.head.y) {
            if (falseRight === false) {
              move = 'right'
            }
            else if (falseDown === false) {
              move = 'down'
            }
            else if (falseUp === false) {
              move = 'up'
            }
          }
          else {
            if (falseLeft === false) {
              move = 'left'
            }
            else if (falseUp === false) {
              move = 'up'
            }
            else if (falseDown === false) {
              move = 'down'
            }
          }
          console.log('X != Y ' + move)
        }
      }
      // else {
      //   var possibleMoves = ['up', 'right', 'down', 'left']
      //   move = possibleMoves[gameData.turn % 4]
      //   console.log('Mod 4: ' + move)
      // }
      console.log('Else: ' + move)
    }
  }
  console.log('MOVE: ' + move)
  response.status(200).send({
    move: move
  })
  console.log('HP: ' + health + ' Size: ' + grideSize)
  if (health - 1 <= grideSize && toClear !== true) {
    console.log("Get Food")
    getFood(gameData)
    toClear = true
  }
  else if (toClear === true) {
    console.log('call clear')
    clearGrid()
    toClear = false
  }
}

function handleEnd(request, response) {
  var gameData = request.body

  console.log('END')
  response.status(200).send('ok')
}

function getFood(gameData) {
  var x
  var y
  for(i in gameData.board.food) {
    // console.log('\nX: ' + gameData.board.food[i].x + ' Y: ' + gameData.board.food[i].y)
    x = gameData.board.food[i].x
    y = gameData.board.food[i].y
    grid[x][y] = 'Food'
  }
  // console.log('\nFood:\n' + grid + '\n\n')
}

function clearGrid() {
  for (var i=0; i<grideSize; i++) {
    grid[i] = []
    for (var j=0; j<grideSize; j++) {
      grid[i][j] = 'Empty'
    }
  }
  // console.log('\n\nClear Food:\n' + grid + '\n\n')
}