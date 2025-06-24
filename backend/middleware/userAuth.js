const jwt = require('jsonwebtoken');
const Admin = require( "../models/Admin.js");

const userAuth =async (req,res,next) => {
    try{
        const cookie= req.cookies
        const {token} = cookie

        if(!token){
            throw new Error('Token not Found')
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const user = await Admin.findById(decoded._id);

        if(!user){
            throw new Error('User Not Found');
        }

        req.user = user
        next()
    }
    catch(err){
        res.status(404).send( err.message);
    }
}

module.exports=userAuth;