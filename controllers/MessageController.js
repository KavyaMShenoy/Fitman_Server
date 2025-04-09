const Message = require('../models/MessageModel');

module.exports = (io) => {
    if (!io) return;

    // Send a message
    const sendMessage = async (req, res, next) => {
        const { senderId, receiverId, content } = req.body;

        try {
            const newMessage = new Message({
                senderId,
                receiverId,
                content,
                timestamp: new Date()
            });

            const savedMessage = await newMessage.save();

            res.status(201).json({
                message: 'Message sent successfully',
                data: savedMessage,
                success: true
            });

            io.to(senderId).emit("newMessage", savedMessage);
            io.to(receiverId).emit("newMessage", savedMessage);
        } catch (error) {
            if (!res.headersSent) next(error);
        }
    };

    // Retrieve messages between user and trainer
    const retrieveMessages = async (req, res, next) => {
        const userId = req.user.id;
        const trainerId = req.params.trainerId;

        try {
            const messages = await Message.find({
                $or: [
                    { senderId: userId, receiverId: trainerId },
                    { senderId: trainerId, receiverId: userId }
                ]
            }).sort({ timestamp: 1 });

            res.status(200).json({ messages, success: true });
        } catch (error) {
            if (!res.headersSent) next(error);
        }
    };

    // Delete a message
    const deleteMessage = async (req, res, next) => {
        const { messageId } = req.params;

        try {
            const message = await Message.findByIdAndDelete(messageId);

            if (message) {
                res.status(200).json({
                    message: 'Message deleted successfully',
                    success: true
                });

                io.to(message.senderId.toString()).emit('deleteMessage', { messageId });
                io.to(message.receiverId.toString()).emit('deleteMessage', { messageId });
            } else {
                res.status(404).json({
                    message: 'Message not found',
                    success: false
                });
            }
        } catch (error) {
            if (!res.headersSent) next(error);
        }
    };

    return {
        sendMessage,
        retrieveMessages,
        deleteMessage
    };
};