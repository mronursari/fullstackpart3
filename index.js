const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

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
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {

    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if(person)
    {
        response.json(person)
    }
    else
    {
        response.status(404).end()
    }
})

app.post('/api/persons', (request, response) => {

    const randomId = Math.floor(Math.random() * 10000)
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

    if(persons.find(person => person.name === reqBody.name))
    {
        return response.status(400).json({
            error: 'name must be unique'
          })
    }

    const person = {id : randomId,
                    name: reqBody.name,
                    number: reqBody.number}

    persons = persons.concat(person)
    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {

    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.get('/info', (request, response) => {
    const peopleCount = persons.length
    response.send(`<p>Phonebook has info for ${peopleCount} people</p>
    <p>${Date()}</p>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})