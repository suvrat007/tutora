const Joi = require('joi');

const signupValidation = Joi.object({
    admin: Joi.object({
        name: Joi.string().min(2).max(30).required().messages({
            'string.min': 'Admin name must be at least 2 characters long.',
            'string.max': 'Admin name cannot exceed 30 characters.',
            'string.empty': 'Admin name is required.'
        }),
        emailId: Joi.string().email({ tlds: { allow: false } }).required().messages({ // tlds: { allow: false } is common for relaxed email validation
            'string.email': 'Admin email must be a valid email address.',
            'string.empty': 'Admin email is required.'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Admin password must be at least 6 characters long.',
            'string.empty': 'Admin password is required.'
        })
    }).required().messages({
        'object.base': 'Admin credentials are required.'
    }),
    instiName: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Institute name must be at least 2 characters long.',
        'string.max': 'Institute name cannot exceed 100 characters.',
        'string.empty': 'Institute name is required.'
    }),
    logo_URL: Joi.string().uri().allow('').messages({ // Allows empty string if no logo is uploaded
        'string.uri': 'Logo URL must be a valid URL.'
    }),
    instituteEmailId: Joi.string().email({ tlds: { allow: false } }).required().messages({ // Renamed this field
        'string.email': 'Institute contact email must be a valid email address.',
        'string.empty': 'Institute contact email is required.'
    }),
    phone_number: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .required()
        .messages({
            'string.pattern.base': 'Phone number must be 10-15 digits long.',
            'string.empty': 'Phone number is required.'
        })
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