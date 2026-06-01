import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any, allowedOrigins: string[]) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.emit("notification", {
      type: "success",
      message: "Connected to TrustSphere realtime engine",
    });

    const intervalId = setInterval(() => {
      const events = [
        "AI fraud analysis completed",
        "New verification request detected",
        "Security scan completed",
        "Realtime sync successful",
        "Enterprise audit generated",
      ];

      const randomEvent = events[Math.floor(Math.random() * events.length)];

      socket.emit("notification", {
        type: "info",
        message: randomEvent,
      });
    }, 8000);

    socket.on("disconnect", () => {
      clearInterval(intervalId);
    });
  });
};

export const getIO = () => io;
