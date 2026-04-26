const jwt = require('jsonwebtoken');

// JWT payload contains { _id, instituteId } — no DB round-trip per request.
// If a route needs the full Admin document (e.g., to mutate it), it must call
// Admin.findById(req.adminId) explicitly inside that route handler.
const userAuth = (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send('Token not Found');
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.adminId = decoded._id;
        req.instituteId = decoded.instituteId || null;
        next();
    } catch (err) {
        res.status(401).send(err.message);
    }
};

module.exports = userAuth;
