require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

morgan.token('additionalInfo', function(req, res){
    if(req.method === 'POST')
    {
        return(JSON.stringify(req.body))
    }
    else
    {
        return(' ')
    }
})

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :additionalInfo'))
app.use(cors())
app.use(express.static('dist'))

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
      },
      {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
      },
      {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
      },
      {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
      }
]

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {

  Person.findById(request.params.id)
  .then(person => {

    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {

    const reqBody = request.body

    const person = new Person({name: reqBody.name,
                    number: reqBody.number})

    person.save().then(savedNote => {
                      response.json(savedNote)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {

    Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const peopleCount = persons.length
    response.send(`<p>Phonebook has info for ${peopleCount} people</p>
    <p>${Date()}</p>`)
  })
})

app.put('/api/persons/:id', (request, response, next) => {

  const reqBody = request.body

  if(!reqBody.name)
  {
      return response.status(400).json({
          error: 'name missing'
        })
  }

  if(!reqBody.number)
  {
      return response.status(400).json({
          error: 'number missing'
        })
  }

  const person = {
    name: reqBody.name,
    number: reqBody.number,
  }

  Person.findByIdAndUpdate(request.params.id,
     person,
      { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})