const logger = require('./logger')


// const getTokenFrom = (request) => {
//   const authorization = request.get('authorization')

//   if(authorization && authorization.startsWith('Bearer ')) {
//     return authorization.replace('Bearer ', "")
//   }else{
//     return null
//   }
// }

function tokenExtractor(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('from tokenExtractor');
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization if the token is not provided' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  req.token = token;
  // req.token ? console.log(req.token) : null

  next();
}


const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
  }
  
  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }


  // Error-handling middleware
  // const errorHandler = ((err, req, res, next) => {
  // console.error(err.stack); 
  // Log the error stack for debugging

  // Respond with a generic error message
//   res.status(500).json({
//     message: 'Something went wrong!',
//     error: process.env.NODE_ENV === 'development' ? err.message : {} // Provide detailed error info only in development
//   });
//   next()
// });

  
  const errorHandler = (error, request, response, next) => {
    logger.error(error.message)
    if(error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
      return response.status(400).json({ error: 'expected `username` to be unique' })
    }else if(error.name === 'MongoServerError' && error.message.includes('User validation failed')) {
      return response.status(400).json({ error: 'username or password are required' })
    }else if(error.name === "ValidationError" && error.message.includes('Blog validation failed')){
      return response.status(400).json({ error: 'field missing' })
    }else if(error.name === "ReferenceError" && error.message.includes("response is not defined")){
      return response.status(400).json({ error: "duplicate username in the database" })
    }
  
    next(error)
  }
  
  module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    // getTokenFrom
  }