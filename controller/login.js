const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../model/users_model')


loginRouter.post('/', async (request, response) => {
    const {username, password} = request.body;

    const user = await User.findOne({ username })
    const passwordCorrect = user === null ? false : bcrypt.compare(password,user.passwordHash)

    if(!(user && passwordCorrect)) {
        return response.status(401).json('Invalid username or password' )
    }

    const tokenCompose = {
        username: user.username,
        id: user._id
    }

    const token = jwt.sign(tokenCompose, process.env.SECRET,{expiresIn:60*60})

    response.status(200).send({token, username: user.username, name: user.name})

})

module.exports = loginRouter