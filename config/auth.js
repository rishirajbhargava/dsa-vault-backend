
const isAuthenticated = (req, res, next) => {
    if(req.user && req.cookies['connect.sid']) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    next();
};

module.exports = isAuthenticated;