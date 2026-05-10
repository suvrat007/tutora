const jwt = require('jsonwebtoken');

const parentAuth = (req, res, next) => {
    try {
        const token = req.cookies.parentToken;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        if (decoded.role !== 'parent') return res.status(403).json({ message: 'Forbidden' });

        req.parentId  = decoded.parentId;
        req.studentId = decoded.studentId;
        req.adminId   = decoded.adminId;
        next();
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

module.exports = parentAuth;
