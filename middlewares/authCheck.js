const jwt = require("jsonwebtoken");
const HttpError = require("../models/httpError");

const authCheck = (req, res, next)=>{
    if(req.method === 'OPTIONS'){
        return next();
    }
    let token;
    try{
        token = req.headers.authorization.split(' ')[1];
        if(!token){
            throw new Error('Authenticaton failed!', 401);
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userName: decodedToken.userName, role: decodedToken.role };
        return next();
    }catch(e){
        console.log(e)
        return next(new HttpError('Authentication failed!' , 401));
    }
}

module.exports = authCheck;