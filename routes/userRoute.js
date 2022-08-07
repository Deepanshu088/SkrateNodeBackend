const express = require('express');
const { check } = require('express-validator');
const usersControllers = require('../controllers/userControllers/userController.js');

const router = express.Router();

router.post('/new',
            [   check('username').not().isEmpty(),
                check('role').isIn(global.ROLES)
            ], 
            usersControllers.loginUser);


module.exports = router;