import { Server } from "socket.io";

export default class WebSocketServer {
  static instance;
  io;

  static getInstance() {
    console.log("EJECUTO");
    if (!WebSocketServer.instance) {
      WebSocketServer.instance = new WebSocketServer();
    }
    return WebSocketServer.instance;
  }

  constructor() {
    this.io = new Server({
      cors: {
        origin: "*",
      },
    });
    this.connection(); // Agregar aquí la llamada a la función connection()
  }

  connection() {
    this.io.on("connection", (socket) => {
      console.log("WebSocket connected");

      socket.on("057470638", (data) => {
        console.log(`Received message on channel 057470638: ${data}`);
      });

      socket.on("disconnect", () => {
        console.log("WebSocket disconnected");
      });
    });
  }

  sendWebSocketMessage(data, channel) {
    // Crear objeto de mensaje para enviar por el WebSocket
    const message = { channel, data };

    // Enviar mensaje por el WebSocket
    this.io.emit("message", message);
  }
}
