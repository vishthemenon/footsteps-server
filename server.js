var app = require('express')()
var r = require('rethinkdbdash')({
  db: 'footsteps',
  host: 'aws-us-east-1-portal.17.dblayer.com',
  port: 11672
})

app.listen('3000', function() {
  console.log("Shit is being served on port 3000")
  r.table('users').filter({email: 'michelle@gmail.com'}).run().then(function(users) {
    console.log(users[0].email)
  })
})
