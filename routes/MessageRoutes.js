const express = require("express");
const router = express.Router();
const Auth = require("../middlewares/Auth");
const MessageController = require("../controllers/MessageController");
const ValidateMessageMiddleware = require("../middlewares/ValidateMessageMiddleware");

module.exports = (io) => {
    const controller = MessageController(io);

    // Send a message with validation
    router.post('/send', Auth, ValidateMessageMiddleware, controller.sendMessage);

    // Retrieve messages between user and trainer
    router.get('/:trainerId', Auth, controller.retrieveMessages);

    // Mark messages as read
    router.patch('/mark-read/:messageId', Auth, controller.markMessages);

    // Delete a message
    router.delete('/:messageId', Auth, controller.deleteMessage);

    return router;
};
