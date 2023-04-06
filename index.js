const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const http = require('http')
const { Server } = require('socket.io')
const app = express()
const server = http.createServer(app)

const messageRoute = require('./routes/message.js')
const userRoute = require('./routes/user.js')
const authRoute = require('./routes/auth')

app.use(express.json())

dotenv.config({ path: './utils/.env' })

const DB = process.env.DATABASE

//Making use of socket.io event emitter
const io = new Server(server, { cors: { origin: '*' } })

mongoose.set('strictQuery', false)
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('Db connect success!!'))
  .catch((error) => console.log(error))

  //Implemented mongodb streams and also with sockect.io
const db = mongoose.connection
db.on('open', () => {
  const observer = db.collection('messages').watch()
  observer.on('change', (change) => {
    console.log(change)
    if (change.operationType === 'insert') {
      const newMessage = {
        message: change.fullDocument.message,
        _id: change.fullDocument._id,
      }
      io.emit('insert', newMessage)
    }
    if (change.operationType === 'update') {
      const updateMessage = {
        message: change.updateDescription.updatedFields.message,
        updatedAt: change.updateDescription.updatedFields.updatedAt,
      }
      console.log(updateMessage)
      io.emit('patch', updateMessage)
    } else {
      console.log('No change')
    }
  })
})

//create connection
io.on('connection', (socket) => {
  console.log('socket connected', socket.id)

  socket.on('disconnect', () => {
    console.log('socket disconnected')
  })

  socket.emit('check', (text) => {
    console.log(text)
  })
})

app.use('/api/messages', messageRoute)
app.use('/api/users', userRoute)
app.use('/api/users', authRoute)

// res.sendFile(__dirname + "/index.html");
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500
  const errorMessage = err.message || 'something went wrong'
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  })
})

app.listen(process.env.PORT || 500, (error) => {
  if(error) console.log(error)
  console.log('🌎 connected')
})
