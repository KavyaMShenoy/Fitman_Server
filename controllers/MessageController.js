const Message = require('../models/MessageModel');

module.exports = (io) => {

    if (!io) {
        return;
    }

    // Send a message
    const sendMessage = async (req, res, next) => {
        const { senderId, receiverId, content } = req.body;

        try {
            const message = new Message({
                senderId,
                receiverId,
                content
            });

            await message.save();

            io.emit('newMessage', {
                id: message._id,
                senderId,
                receiverId,
                content,
                timestamp: message.timestamp,
                isRead: message.isRead
            });

            res.status(201).json({
                message: 'Message sent successfully',
                data: message,
                success: true
            });

        } catch (error) {
            next(error);
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

            res.status(200).json({
                messages,
                success: true
            });

        } catch (error) {
            next(error);
        }
    };

    // Mark messages as read
    const markMessages = async (req, res, next) => {
        const { messageId } = req.params;

        try {
            const message = await Message.findByIdAndUpdate(
                messageId,
                { isRead: true },
                { new: true }
            );

            if (message) {
                io.to(message.senderId.toString()).emit('markRead', { messageId });
                io.to(message.receiverId.toString()).emit('markRead', { messageId });

                res.status(200).json({
                    message: 'Message marked as read',
                    success: true
                });
            } else {
                res.status(404).json({
                    message: 'Message not found',
                    success: false
                });
            }

        } catch (error) {
            next(error);
        }
    };

    // Delete a message
    const deleteMessage = async (req, res, next) => {
        const { messageId } = req.params;

        try {
            const message = await Message.findByIdAndDelete(messageId);

            if (message) {
                io.to(message.senderId.toString()).emit('deleteMessage', { messageId });
                io.to(message.receiverId.toString()).emit('deleteMessage', { messageId });

                res.status(200).json({
                    message: 'Message deleted successfully',
                    success: true
                });
            } else {
                res.status(404).json({
                    message: 'Message not found',
                    success: false
                });
            }

        } catch (error) {
            next(error);
        }
    };

    return {
        sendMessage,
        retrieveMessages,
        markMessages,
        deleteMessage
    };
};