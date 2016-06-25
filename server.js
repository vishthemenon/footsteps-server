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

app.post('/user/session', function(req, res) {
  r.table('users').filter({name: req.body.name}).run().then(function(result) {
    if(result === null) {
      res.send('User not found')
    }
    else {
      res.send(result[0].id)
    }
  })
})

app.post('/routes', function(req, res) {
  var generated_coord = [1, 2]
  r.table('routes').insert({
    user_id: req.body.user_id,
    coord: [req.body.start_point, generated_coord, req.body.end_point]
  }).run().then(function(result) {
    res.send(result)
  })
})

app.get('/users/:id/routes', function(req, res) {
  r.table('routes').filter({user_id: req.params.id}).run().then(function(result) {
    res.send(result)
  })
})

app.post('/message', function(req, res) {
  r.table('messages').insert({
    group_id: req.body.group_id,
    user_id: req.body.user_id,
    message: req.body.message,
    time: Math.floor((new Date()).getTime()/1000)
  }).run().then(function(result) {
    res.send(result)
  })
})

app.get('/groups/:id/messages/', function(req, res) {
  r.table('messages').filter({group_id: parseInt(req.params.id)}).run().then(function(result) {
    var fresult = []
    result.map(function(msg) {
      r.table('users').get(msg.user_id).run().then(function(user) {
        fresult.push({
          message: msg.message,
          user_name: titleCase(user.name),
          time: msg.time
        })
      })
    })
    var asyncCheck = setInterval(function() {
      if (result.length == fresult.length) {
        clearInterval(asyncCheck);
        res.send(fresult)
      }
    }, 2);
  })
})


app.listen((process.env.PORT||3000), function() {
  console.log("Shit is being served on port 3000")
})


function titleCase(str) {
  str = str.toLowerCase().split(' ');

  for(var i = 0; i < str.length; i++){
    str[i] = str[i].split('');
    str[i][0] = str[i][0].toUpperCase();
    str[i] = str[i].join('');
  }
  return str.join(' ');
}
