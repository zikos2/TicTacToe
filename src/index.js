const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const checkWinner = require("./helpers");

const refreshRate = 700;

let cid = 0;
let gid = 10;   
const clients = {};
const games = {}; 

let winner = null;

io.on("connection", (socket) => {
  const clientId = cid++;

  clients[clientId] = socket;
  socket.emit("connectUser", clientId);

  //Create a new game
  socket.on("create", (id) => {
    const gameId = gid++;
    console.log(id);

    games[gameId] = {
      id: gameId,
      board: [null, null, null, null, null, null, null, null, null],
      clients: [
        {
          clientId: id,
          mark: "X",
        },
      ],
      turn: id,
      winner: null,
    };

    clients[id].emit("gameCreated", gameId);
  });

  //Join an existing game
  socket.on("joinGame", (payload) => {
    const { clientId, gameId } = payload;
    const game = games[gameId];

    if (game.clients.length > 1) {
      const errorMessage = "Game already full";
      clients[clientId].emit("error", errorMessage);
      return;
    }

    game.clients.push({
      clientId: clientId,
      mark: "O",
    });

    if (game.clients.length === 2) updateState(); 
    game.clients.forEach((client) => {
      clients[client.clientId].emit("clientJoined", game);
    });
  });

  //Update the board
  socket.on("play", (payload) => {
    const game = games[payload.gameId];
    const client = game.clients.filter(
      (client) => client.clientId === payload.clientId
    )[0];
      if(game.board[payload.cell] != null){
        return;
      }
    game.board[payload.cell] = client.mark;
    game.turn = game.clients.filter(
      (cl) => cl.clientId != payload.clientId
    )[0].clientId;
    console.log(game.turn, "last played", client.clientId);
  });

  console.log("client connected");
});  

//Update game state
function updateState() {
  for (const g of Object.keys(games)) {
    const game = games[g];
    const winnerCheck = checkWinner(game.board);
    if (winnerCheck != null) {
      if(winnerCheck === "tie"){
        game.winner = "tie"
      }else{
        game.winner = game.clients.filter(
          (client) => client.mark === winnerCheck
        )[0].clientId;
      }

    }

    game.clients.forEach((client) => {
      clients[client.clientId].emit("updateGameState", game);
    });
  }
  setTimeout(updateState, refreshRate);
}

httpServer.listen(4000, () => console.log("Server running on port 4000..."));
