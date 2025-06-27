export const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: "This link is not found",
        errors: [`${req.originalUrl} does not exist`],
    });
};