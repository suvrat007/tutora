const Joi = require('joi');


const signupValidation = Joi.object({
    name: Joi.string().min(2).max(30).required(),
    emailId: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const logInValidation = Joi.object({
    emailId:Joi.string().email().required(),
    password: Joi.string().min(6).required()
})

const editProfileValidation = (req)=>{
    const allowedEditFields=['firstName','lastName','photoUrl']
    return Object.keys(req.body).every((field) =>
        allowedEditFields.includes(field)
    )
}

module.exports={
    signupValidation,
    logInValidation,
    editProfileValidation,
}