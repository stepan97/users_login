// const express = require('express');
// const _ = require('lodash');

const {Todo, validateTodo} = require('../models/TodoModel');
const User = require('../models/UserModel').User;

let Controller = {
    addTodo: async function(req, res, next){
        const user = await User.findById(req.user._id);
        if(!user){
            let error = new Error("Invalid user ID.");
            error.statusCode = 404;
            return next(error);
        }

        const {error} = validateTodo(req.body);
        if(error) {
            let err = new Error(error.details[0].message);
            err.statusCode = 400;
            return next(err);
        }

        let newTodo = new Todo({
            user: req.user._id,
            title: req.body.title,
            description: req.body.description,
            isDone: req.body.isDone || false,
            createdAt: Date.now()
        });

        await newTodo.save();
        // chilnum es takiny
        newTodo.user = {
            _id: user._id,
            name: user.name
        }
        res.json(newTodo);
    },

    deleteTodo: async function(req, res, next){
        const user = await User.findById(req.user._id);
        if(!user){
            let error = new Error("Invalid user ID.");
            error.statusCode = 404;
            return next(error);
        }

        const todoID = req.params.id;
        const todo = await Todo.findById(todoID).populate("user", "name");
        if(!todo){
            let error = new Error("Invalid todo id.");
            error.statusCode = 404;
            return next(error);
        }
        if(!(String(todo.user._id) === String(user._id))){
            let error = new Error("You don't own this item.");
            error.statusCode = 403;
            return next(error);
        }

        await todo.remove();
        res.send(todo);
    },

    updateTodo: async function(req, res, next){
        const user = await User.findById(req.user._id);
        if(!user){
            let error = new Error("Invalid user ID.");
            error.statusCode = 404;
            return next(error);
        }

        const todo = await Todo.findById(req.params.id);
        if(!todo){
            let error = new Error("Invalid todo id.");
            error.statusCode = 404;
            return next(error);
        }

        // title, description, isDone
        if(req.body.title)
            todo.title = req.body.title;
        if(req.body.description)
            todo.description = req.body.description;
        if(req.body.isDone)
            todo.isDone = req.body.isDone;

        await todo.save();
        res.json(todo);
    },

    getAllTodos: async function(req, res, next) {
        const userID = req.user._id;
        if(!userID){
            let error = new Error("No user ID provided.");
            error.statusCode = 400;
            return next(error);
        }

        const user = await User.findById(req.user._id);
        if(!user){
            let error = new Error("Invalid user ID.");
            error.statusCode = 404;
            return next(error);
        }

        const todos = await Todo
            .find({user: userID})
            .populate('user', "name");
        if(!todos){
            let error = new Error("Invalid esiminch.");
            error.statusCode = 404;
            return next(error);
        }

        res.json(todos);
    }
}

module.exports = Controller;