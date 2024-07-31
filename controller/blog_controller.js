const blogRouter = require('express').Router()
const Blog = require('../model/blog_model')
const User = require('../model/users_model')
const jwt = require('jsonwebtoken')




blogRouter.get('/', async (request, response) => {
      const post = await Blog.find({}).populate('user', {username:1, name:1})
      response.json(post)
  })

  
  blogRouter.post('/', async (request, response) => {
    const body = request.body

    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if(!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
  
    const user = await User.findById(decodedToken.id)

    const post = new Blog({
      url: body.url,
      title: body.title,
      author: body.author,
      user: user._id,
      likes: body.likes
    })

    const savePosts = await post.save()
    user.posts = user.posts.concat(savePosts._id)
    await user.save()

    response.status(201).json(savePosts)
  })


  blogRouter.delete('/:id', async (request, response) => {
    const id = request.params.id
    const blog = await Blog.findById(id)
    
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if(!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
  
    const user = await User.findById(decodedToken.id)

    if(blog.user.toString() === user._id.toString()) {
      await Blog.findByIdAndDelete(id)
      return response.status(204).json('post deleted successfully')
    }else{
      return response.status(401).json('unauthorized')
    }
    

    // console.log(blog.user.toString());
    // console.log(user._id.toString());
  })




  module.exports = blogRouter