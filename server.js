const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');

// const cronScheduler = require("./utils/cronScheduler");
// cronScheduler;

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
const RatingRoutes = require('./routes/MessageRoutes');
const ReminderRoutes = require('./routes/ReminderRoutes');

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
app.use('/messages', MessageRoutes(io));
app.use('/ratings', RatingRoutes);
app.use('/reminder', ReminderRoutes);

io.on('connection', (socket) => {

    socket.on("sendMessage", (message) => {
        io.emit("newMessage", message);
    });

    socket.on('disconnect', () => {
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