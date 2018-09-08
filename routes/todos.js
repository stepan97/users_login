const todosController = require('../controllers/todosController');
const express = require('express');
const auth = require('../middleware/auth');

let router = express.Router();

router.post('/addTodo', auth, todosController.addTodo);

router.post('/addTodos', auth, todosController.addTodos);

router.put('/updateTodo/:id', auth, todosController.updateTodo);

router.delete('/deleteTodo/:id', auth, todosController.deleteTodo);

router.get('/getAll', auth, todosController.getAllTodos);

module.exports = router;