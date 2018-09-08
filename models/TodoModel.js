const mongoose = require('mongoose');
const joi = require('joi');
joi.objectId = require('joi-objectid')(joi);

const todoSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    isDone: {
        type: boolean
    },
    createdAt: {
        type: Date // Date.now()
    }
});


function validateTodo(todo){
    const schema = {
        userId: joi.objectId.required(),
        title: joi.string().required(),
        description: joi.string(),
        isDone: joi.bool().default(false)
    }

    return joi.validate(todo, schema);
}

module.exports.Todo = mongoose.model('Todo', todoSchema);
module.exports.validateTodo = validateTodo;