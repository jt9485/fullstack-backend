const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('json_contents', (request, response) => {
  return JSON.stringify(request.body)
})

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.method(req, res) === 'GET' ? '' : tokens.json_contents(req, res)
  ].join(' ')
}))

let people = [
    { 
      id: 1,
      name: "Arto Hellas", 
      number: "040-123456"
    },
    { 
      id: 2,
      name: "Ada Lovelace", 
      number: "39-44-5323523"
    },
    { 
      id: 3,
      name: "Dan Abramov", 
      number: "12-43-234345"
    },
    { 
      id: 4,
      name: "Mary Poppendieck", 
      number: "39-23-6423122"
    }
]

app.get('/api/people', (request, response) => {
  response.json(people)
})

app.get('/api/people/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = people.find(p => p.id === id)
  if(person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/people/:id', (request, response) => {
  const id = Number(request.params.id)
  people = people.filter(p => p.id !== id)

  response.status(204).end()
})

app.post('/api/people', (request, response) => {
  const person = request.body

  console.log(person)
  
  if(!person.name || !person.number) {
    response.status(400).json({
      error: 'Fields missing'
    })
    return
  }

  if(people.find(p => p.name === person.name)) {
    response.status(400).json({
      error: 'This name has already been indexed'
    })
    return
  }

  person.id = Math.round(Math.random() * people.length * 1000)
  people = people.concat(person)
  response.json(person)
})

// Ooops should not have done this
app.put('/api/people/:id', (request, response) => {
  const updatedPerson = request.body
  const target = people.find(p => p.id === updatedPerson.id)
  
  if(target) {
    target.name = updatedPerson.name
    target.number = updatedPerson.number
    response.json(target)
  } else {
    response.status(400).json({
      error: 'Cannot find entry with given id'
    })
  }
  
})

app.get('/info', (request, response) => {
  const date = new Date()
  response.send(`<p> Phonebook has info for ${people.length} people.</p> <p> ${date.toLocaleString()} </p>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})