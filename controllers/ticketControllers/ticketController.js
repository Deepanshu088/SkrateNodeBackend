const { validationResult } = require('express-validator');
// const jwt = require('jsonwebtoken');
const HttpError = require('../../models/httpError');
const Ticket = require('../../models/ticket');
const User = require('../../models/user');

const create = async(req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next( new HttpError('Invalid Inputs, Please check again!!',422) );
    }

    let { title, description, priority, assignedTo } = req.body;

    try{
        if(assignedTo){
            let assignedUser = await User.findOne({userName: assignedTo});
            if(!assignedUser){
                throw new HttpError("Invalid username!!!", 404);
            }
        }

        let newTicket = new Ticket({
            title: title,
            description: description,
            priority: priority || "low",
            assignedTo: assignedTo || null
        })

        await newTicket.save();

        return res.status(201).json({ id: newTicket.id });
    }catch(e){
        return next( new HttpError(e.message || "Couldn't create new ticket. Something Went Wrong!!!!!", e.code || 500 ) );
    }
}

const getAllTickets = async(req, res, next)=>{
    try{
        let tickets = await Ticket.find();
        return res.status(200).json({"tickets": tickets});
    }catch(e){
        return next( new HttpError(e.message || "Couldn't fetch tickets. Something Went Wrong!!!", e.code || 500 ) );
    }
}

const getTicketsByQuery = async(req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next( new HttpError('Invalid Inputs, Please check again!!',422) );
    }

    let { status, title, priority } = req.query;
    let query = {};
    if(status){
        query.status = status;
    }
    if(title){
        query.title = title;
    }
    if(priority){
        query.priority = priority;
    }

    try{
        let tickets = await Ticket.find(query);
        return res.status(200).json({"tickets": tickets});
    }catch(e){
        return next( new HttpError(e.message || "Couldn't fetch tickets. Something Went Wrong!!!", e.code || 500 ) );
    }
}

const closeTicket = async(req, res, next)=>{
    try{
        let ticketId = req.params.ticketID;
        let ticket = await Ticket.findById(ticketId);
        if(!ticket){
            throw new HttpError("Invalid Ticket Id!!!, ticket doesn't exist.", 404);
        }

        // Check if the ticket is already closed.
        if(ticket.status == "closed"){
            throw new HttpError("Ticket has already been closed", 403);
        }
        if(req.user.role != "admin" && req.user.userName != ticket.assignedTo){
            throw new HttpError("Unauthorized", 401)
        }
        if(ticket.priority != "high"){
            let priorityFilter = ["high"];
            if(ticket.priority == "low"){
                priorityFilter.push("mid");
            }

            let higherPriorityTickets = await Ticket.find({assignedTo: req.user.userName, status: "open", priority: {$in: priorityFilter}});
            if(higherPriorityTickets && higherPriorityTickets[0]){
                return res.status(403).json({message: "A higher priority task remains to be closed", tickets: higherPriorityTickets});
            }
        }

        ticket.status = "closed";
        await ticket.save();

        return res.status(200).json({message: "Closed the ticket.", id: ticket.id});
    }catch(e){
        return next( new HttpError(e.message || "Couldn't close the ticket. Try Again!!!", e.code || 500 ) );
    }
}

const deleteTicket = async(req, res, next)=>{
    try{
        let ticketId = req.params.ticketID;

        let ticket = await Ticket.findById(ticketId);
        if(!ticket){
            throw new HttpError("Invalid Ticket Id!!!, ticket doesn't exist.", 404);
        }

        await Ticket.findByIdAndDelete(ticketId);

        return res.status(200).json({message: "Deleted the ticket."});
    }catch(e){
        return next( new HttpError(e.message || "Couldn't delete ticket. Try Again!!!", e.code || 500 ) );
    }
}

exports.create = create;
exports.getAllTickets = getAllTickets;
exports.getTicketsByQuery = getTicketsByQuery;
exports.closeTicket = closeTicket;
exports.deleteTicket = deleteTicket;