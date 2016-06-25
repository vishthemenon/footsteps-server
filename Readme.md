```
GET /users - get all users' data
GET /users/:id - get user dat by id
GET /routes - get all routes
POST /routes - create new routes
  {
    user_id: integer,
    start_point: [lat, long]
    end_point: [lat, long]
  }
GET /users/:username/routes - get routes belonging to the user
POST /message - new chat message
  {
    group_id : 1/2/3,
    user_id : integer,
    message: string
  }
POST /groups/:id/:username - add user to a group by username
  {
  }
GET /login/:username - lots of random stuff including current_user data
GET /groups/:id - messages, profile_pics, leaderboard data for the group

```
