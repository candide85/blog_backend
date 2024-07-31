const bcrypt = require('bcrypt')
const userRoute = require('express').Router()
const User = require('../model/users_model')


userRoute.get('/', async (request, response) =>{
    const user = await User.find({}).populate('posts',{url:1, title:1, author:1})
    response.json(user)
})

// const duplicate = (value1, value2) => {
//     if(value1 !== value2) {
//         return response.status(400).send({"error": "username exist"})
//     }
// }

userRoute.post('/', async (request, response) => {
    const {username, name, password} = request.body
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

   if(username === "" ) {
    return response.status(400).json(({"error": "missing username"}))
   }

   if(password === "" ) {
    return response.status(400).json({"error":"missing password"})
   }

//    duplicate(await User.find({username}), username)


    const user = new User({
        username,
        name,
        passwordHash
    })

    const saveNewUser = await user.save()

    response.status(201).json(saveNewUser)
    
})


module.exports = userRoute