const express = require('express');
const { check } = require('express-validator');
const ticketController = require('../controllers/ticketControllers/ticketController');
const authCheck = require('../middlewares/authCheck');
const HttpError = require("../models/httpError");

const router = express.Router();

async function allowAdmins(req,res, next){
    if(req.user.role == "admin"){
        next();
    }else{
        return next(new HttpError('Unauthorized!' , 401));
    }
}

router.use(authCheck);

router.get('/',[
                check('priority').isIn([undefined, ...global.PRIORITY]),
                check('status').isIn([undefined, "open", "closed" ]),
            ],
            ticketController.getTicketsByQuery
        );

router.post('/markAsClosed/:ticketID', ticketController.closeTicket);
router.get('/all', ticketController.getAllTickets);

// Allow Admin Users only for below requests
router.use(allowAdmins);
router.delete('/delete/:ticketID', ticketController.deleteTicket);
router.post('/new', [   check('title').not().isEmpty(),
                        check('description').not().isEmpty(),
                        check('priority').isIn([null, ...global.PRIORITY])
                    ],
                    ticketController.create
            );

module.exports = router;