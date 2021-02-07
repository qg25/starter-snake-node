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
  var width = gameData.board.width
  var height = gameData.board.height
  
  for (var i=0; i<width; i++) {
    grid[i] = []
    for (var j=0; j<height; j++) {
      grid[i][j] = 'Empty'
    }
  }
  grideSize = grid.length
  console.log('grideSize: ' + grideSize)

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
  var tailX = gameData.you.body[gameData.you.body.length - 1].x
  var tailY = gameData.you.body[gameData.you.body.length - 1].y

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
      if (gameData.you.head.y + 1 === tailY && gameData.you.head.x === tailX) {
        falseUp = false
      }
    }
    if (gameData.you.head.x + 1 === gameData.you.body[i].x &&
          gameData.you.head.y === gameData.you.body[i].y) {
      falseRight = true
      if (gameData.you.head.x + 1 === tailX && gameData.you.head.y === tailY) {
        falseRight = false
      }
    }
    if (gameData.you.head.y - 1 === gameData.you.body[i].y &&
          gameData.you.head.x === gameData.you.body[i].x) {
      falseDown = true
      if (gameData.you.head.y - 1 === tailY && gameData.you.head.x === tailX) {
        falseDown = false
      }
    }
    if (gameData.you.head.x - 1 === gameData.you.body[i].x &&
          gameData.you.head.y === gameData.you.body[i].y) {
      falseLeft = true
      if (gameData.you.head.x - 1 === tailX && gameData.you.head.y === tailY) {
        falseLeft = false
      }
    }
  }

  console.log('\nfalseUp: ' + falseUp)
  console.log('falseRight: ' + falseRight)
  console.log('falseDown: ' + falseDown)
  console.log('falseLeft: ' + falseLeft + '\n')

  if (health <= (grideSize || gameData.you.body.length)) {
    console.log("HUNGRY")
    getSnakes(gameData)
    grid[tailX][tailY] = 'Empty'
    var shortestPath = findPath(gameData.you.head)
    console.log('Path: ' + shortestPath)
    console.log('Path to move: ' + shortestPath[0])
    
    console.log('IF: ' + shortestPath[0] === 'false')
    if (shortestPath === 'false') {
      if (falseUp === false) {
        move = 'up'
      }
      else if (falseRight === false) {
        move = 'right'
      }
      else if (falseDown === false) {
        move = 'down'
      }
      else {
        move = 'left'
      }
    }
    else {
      move = shortestPath[0]
    }
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
          if (falseDown === false) {
            move = 'down'
          }
          else if (falseLeft === false) {
            move = 'left'
          }
          else if (falseUp === false) {
              move = 'up'
          }
          else if (falseRight === false) {
            move = 'right'
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
            else {
              move = 'left'
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
            else {
              move = 'right'
            }
          }
          console.log('X != Y ' + move)
        }
      }
      console.log('Else: ' + move)
    }
  }
  console.log('MOVE: ' + move)
  response.status(200).send({
    move: move
  })
  console.log('HP: ' + health + ' Size: ' + gameData.you.body.length + ' Turn: ' + gameData.turn)
  if (toClear === true) {
    console.log('Called clear')
    clearGrid()
    toClear = false
  }

  if (health - 1 <= grideSize && toClear !== true) {
    console.log("Get Food")
    getFood(gameData)
    toClear = true
  }
  console.log('Not Called\n')
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

function getSnakes(gameData) {
  var x
  var y
  for(i in gameData.board.snakes) {
    for(j in gameData.board.snakes[i].body) {
      x = gameData.board.snakes[i].body[j].x
      y = gameData.board.snakes[i].body[j].y
      // console.log('\nX:' + x + ' Y: ' + y + '\n')
      grid[x][y] = 'Snake'
    }
  }
  x = gameData.you.head.x
  y = gameData.you.head.y
  grid[x][y] = 'Start'
  // console.log('\nSnake:\n' + grid + '\n\n')
}

function findPath(head) {
  var startX = head.x
  var startY = head.y

  var location = {
    startX: startX,
    startY: startY,
    path: [],
    status: 'Start'
  }

  var queue = [location]

  while (queue.length > 0) {
    //Remove first location
    var currentLocation = queue.shift()

    //Explore Top Area
    var newLocation = exploreDirection(currentLocation, 'up')
    if (newLocation.status === 'Food') {
      return newLocation.path
    }
    else if (newLocation.status === 'Valid') {
      queue.push(newLocation)
    }

    //Explore Bottom Area
    var newLocation = exploreDirection(currentLocation, 'down')
    if (newLocation.status === 'Food') {
      return newLocation.path
    }
    else if (newLocation.status === 'Valid') {
      queue.push(newLocation)
    }

    //Explore Left Area
    var newLocation = exploreDirection(currentLocation, 'left')
    if (newLocation.status === 'Food') {
      return newLocation.path
    }
    else if (newLocation.status === 'Valid') {
      queue.push(newLocation)
    }

    //Explore Right Area
    var newLocation = exploreDirection(currentLocation, 'right')
    if (newLocation.status === 'Food') {
      return newLocation.path
    }
    else if (newLocation.status === 'Valid') {
      queue.push(newLocation)
    }
  }

  // No valid path
  return 'false'
}

function locationStatus(location) {
  var x = location.startX
  var y = location.startY

  if (location.startX < 0 || location.startX >= grideSize ||
        location.startY < 0 || location.startY >= grideSize) {
          return 'Invalid'
        }
  else if (grid[x][y] === 'Food') {
    return 'Food'
  }
  else if (grid[x][y] !== 'Empty') {
    return 'Blocked'
  }
  else {
    return 'Valid'
  }
}

function exploreDirection(currentLocation, direction) {
  var newPath = currentLocation.path.slice()
  newPath.push(direction)

  var x = currentLocation.startX
  var y = currentLocation.startY

  if (direction === 'up') {
    y += 1
  }
  else if (direction === 'down') {
    y -= 1
  }
  else if (direction === 'left') {
    x -= 1
  }
  else if (direction === 'right') {
    x += 1
  }

  var newLocation = {
    startX: x,
    startY: y,
    path: newPath,
    status: 'Unknown'
  }

  newLocation.status = locationStatus(newLocation)

  if (newLocation.status === 'Valid') {
    grid[newLocation.startX][newLocation.startY] = 'Visited'
  }

  return newLocation
}