const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const HttpError = require('../../models/httpError')
const User = require('../../models/user');

const loginUser = async(req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next( new HttpError('Invalid Inputs, Please check again!!',422) );
    }

    try{
        let {username, role} = req.body;
        let existingUser = await User.findOne({ userName: username });
        let userRole;
        if(!existingUser){
            var newUser = new User({
                userName: username,
                role: role
            });
            await newUser.save();
            userRole = newUser.role;
        }

        token = jwt.sign({userName: username, role: userRole || existingUser.role}, process.env.JWT_SECRET, { expiresIn: '1h'});
        
        return res.status(200).json({"authToken": token});

    }catch(e){
        return next( new HttpError(e.message || "Couldn't login something went", e.code || 500 ) );
    }

}

exports.loginUser = loginUser;