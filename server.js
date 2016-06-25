var app = require('express')()
var bodyParser = require('body-parser')
var r = require('rethinkdbdash')({
  db: 'footsteps',
  host: 'ec2-54-169-219-166.ap-southeast-1.compute.amazonaws.com',
  port: 28015
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/users', function(req, res) {
  r.table('users').run().then(function(result) {
    console.log(result)
    res.send(result)
  })
})

app.get('/user/:id', function(req, res) {
  r.table('users').get(req.params.id).run().then(function(result) {
    if(result === null) {
      res.send('user not found')
    }
    else {
      res.send(result)
    }
  })
})

app.post('/user/session/new', function(req, res) {
  r.table('users').filter({email: req.body.email}).run().then(function(result) {
    if(result === null) {
      res.send('user not found')
    }
    else {
      res.send(result)
    }
  })
})

app.post('/user/new', function(req, res) {

})


app.listen((process.env.PORT||3000), function() {
  console.log("Shit is being served on port 3000")
})
