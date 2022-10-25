import WebSocketServer from './WebSocketServer.mjs';

WebSocketServer.use((socket) => {
  socket.on('conectado', async (args) => {
    console.log(args);
  });
});

WebSocketServer.use((socket) => {
  socket.on('desconectado', async (args) => {
    console.log(args);
  });
});

export default WebSocketServer;
