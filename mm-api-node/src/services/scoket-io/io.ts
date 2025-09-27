import { io } from "src/app";

io.on("connection", (socket) => {
  socket.on("registerUser", (userId) => {
    socket.join(userId);

    if (process.env.NODE_ENV !== "production") {
      console.log(`User ${userId} connected with socket ID: ${socket.id}`);

      socket.on("disconnect", () => {
        console.log(`Socket ${socket.id} disconnected`);
      });
    }
  });
});
