const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');

const { HandleGenericErrors } = require('./errors/GenericErrors');

dotenv.config();

connectDB();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    }
});

app.use(bodyParser.json());

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

const UserRoutes = require('./routes/UserRoutes');
const AdminRoutes = require('./routes/AdminRoutes');
const AppointmentRoutes = require('./routes/AppointmentRoutes');
const NutritionRoutes = require('./routes/NutritionRoutes');
const PaymentRoutes = require('./routes/PaymentRoutes');
const TrainerRoutes = require('./routes/TrainerRoutes');
const WorkoutRoutes = require('./routes/WorkoutRoutes');
const MessageRoutes = require('./routes/MessageRoutes');

app.get('/', (req, res) => {
    res.json("Fitness Management System")
});

app.use('/auth', UserRoutes);
app.use('/admin', AdminRoutes);
app.use('/appointment', AppointmentRoutes);
app.use('/nutrition', NutritionRoutes);
app.use('/payment', PaymentRoutes);
app.use('/trainer', TrainerRoutes);
app.use('/workout', WorkoutRoutes);
console.log("Mounting message routes...");
app.use('/messages', MessageRoutes(io));

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their private room`);
    });

    socket.on("leave", (userId) => {
        socket.leave(userId);
        console.log(`User ${userId} left their private room`);
    });

    socket.on("sendMessage", (message) => {
        const { senderId, receiverId } = message;
        io.to(senderId).emit("newMessage", message);
        io.to(receiverId).emit("newMessage", message);
    });

    socket.on('newMessage', (newMessage) => {
        if (
          (newMessage.senderId === userId && newMessage.receiverId === trainerId) ||
          (newMessage.senderId === trainerId && newMessage.receiverId === userId)
        ) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      });      

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});


app.all('*', (req, res) => {
    res.status(400).json({ message: 'End point does not exist.' });
});

app.use(HandleGenericErrors);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log("Server running at " + process.env.SERVER_URL);
});