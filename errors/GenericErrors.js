const HandleGenericErrors = (error, req, res, next) => {
    try {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Something went wrong. Please try again.';

        return res.status(statusCode).json({ message: message, success: false });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong.', success: false });
    }
}

module.exports = { HandleGenericErrors };