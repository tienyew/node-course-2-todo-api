var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');
const fs = require('fs');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use((req, res, next) => {
  var now = new Date().toString();
  var log = `${now}: ${req.method} ${req.url}`;
  console.log(log);
  fs.appendFile('server.log', log + '\n', (err) => {
    if (err) {
      console.log('Unable to append to server.log');
    }
  });
  next();
});

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  })
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(404).send('ID not valid');
  }

  Todo.findByIdAndRemove(id)
    .then((todo) => !todo ? res.status(404).send('Todo not found') : res.send({todo}))
    .catch((e) => res.status(400).send(e));;
});

app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(404).send('ID not valid');
  }

  Todo.findById(id)
    .then((todo) => !todo ? res.status(404).send('Todo not found') : res.send({todo})
    )
    .catch((e) => res.status(400).send(e));
});



app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
