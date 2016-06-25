var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var r = require('rethinkdbdash')({
  db: 'footsteps',
  host: 'ec2-54-169-219-166.ap-southeast-1.compute.amazonaws.com',
  port: 28015
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
})

app.get('/users', function(req, res) {
  r.table('users').run().then(function(result) {
    console.log(result)
    res.send(result)
  })
})

app.get('/users/:id', function(req, res) {
  r.table('users').get(parseInt(req.params.id)).run().then(function(result) {
    if(result === null) {
      res.send ('user not found')
    }
    else {
      res.send(result)
    }
  })
})

app.post('/users/session', function(req, res) {
  r.table('users').filter({name: req.body.name}).run().then(function(result) {
    if(result === null) {
      res.send('User not found')
    }
    else {
      res.send(result[0].id)
    }
  })
})

app.get('/routes', function(req, res) {
  r.table('routes').run().then(function(result) {
    res.send(result[0].coord)
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

app.get('/users/:username/routes', function(req, res) {
  r.table('routes').filter({user_name: req.params.username}).run().then(function(result) {
    res.send(result)
  })
})

app.post('/message', function(req, res) {
  r.table('messages').insert({
    group_id: req.body.group_id,
    user_id: req.body.user_id,
    message: req.body.message,
    time: Math.floor((new Date()).getTime()/1000)
  })
  .run().then(function(result) {
    res.send(result)
  })
})

app.post('/groups/:id/:username', function(req, res) {
  r.table('users').filter({user_name: req.params.username}).update({
    group_id: r.row('group_id').append(req.params.id)
  }).run().then(function(result) {
    res.send(result)
  })
})

app.get('/login/:username', function(req, res) {
  r.table('messages').orderBy({index: 'time'}).filter({group_id: 1}).run().then(function(result) {
    var profiles = []
    var fresult = []
    r.table('users').orderBy({index: r.desc('total_distance')}).run().then(function(users) {

      result.map(function(msg) {
        var user = users.find(function(j) {
          return j.id === msg.user_id
        })
        fresult.push({
          message: msg.message,
          display_name: titleCase(user.name),
          user_name: user.user_name,
          time: msg.time
        })
      })
      users.map(function(user) {
        profiles.push({
          user_name: user.user_name,
          display_name: user.name,
          profile_url: user.profile_pic,
          total_distance: user.total_distance
        })
      })

      res.send({
        messages : fresult,
        profiles : profiles,
        current_user : users.find(function(k) {
          return k.user_name === req.params.username
        })
      })
    })
  })
})

app.get('/groups/:id', function(req, res) {
  r.table('messages').orderBy({index: 'time'}).filter({group_id: parseInt(req.params.id)}).run().then(function(result) {
    var profiles = []
    var fresult = []
    r.table('users').orderBy({index: r.desc('total_distance')}).filter(function(user) {
      return user("group_id").contains(req.params.id)
    }).run().then(function(users) {

      result.map(function(msg) {
        var user = users.find(function(j) {
          return j.id === msg.user_id
        })
        fresult.push({
          message: msg.message,
          display_name: titleCase(user.name),
          user_name: user.user_name,
          time: msg.time
        })
      })
      users.map(function(user) {
        profiles.push({
          user_name: user.user_name,
          display_name: user.name,
          profile_url: user.profile_pic,
          total_distance: user.total_distance
        })
      })

      res.send({
        messages : fresult,
        profiles : profiles,
        current_user : users.find(function(k) {
          return k.user_name === req.params.username
        })
      })
    })
  })
})
// var asyncCheck = setInterval(function() {
//   if (result.length == fresult.length) {
//     clearInterval(asyncCheck);
//     res.send({
//       messages: fresult,
//       profiles: profiles})
//   }
// }, 2);
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
