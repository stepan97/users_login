const todosController = require('../controllers/todosController');
const express = require('express');
const auth = require('../middleware/auth');

let router = express.Router();

router.post('/addTodo', auth, todosController.addTodo);

router.put('/updateTodo/:id', auth, todosController.updateTodo);

router.get('/deleteTodo/:id', auth, todosController.deleteTodo);

router.get('/getAll', auth, todosController.getAllTodos);

module.exports = router;