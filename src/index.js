import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const app = express()
// app.use(verifyIfAccountExistsCpf)
app.use(express.json())
/**
 cpf - string
name - string
id - uuid
statement []
*/
const customers = []

const verifyIfAccountExistsCpf = (req, res, next) => {
  const { cpf } = req.headers

  const customer = customers.find((customer) => customer.cpf === cpf)
  if (!customer) {
    return res.status(404).json({ error: 'customer not found' })
  }
  req.customer = customer
  return next()
}

const getBalance = (statement) => {
  const balance = statement.reduce((acc, operation) => {
    if(operation.type === credit) {
      return acc + operation.ammount;
    }
    else {
      return acc - operation.ammount
    }
  }, 0)

  return balance
}

app.post('/accounts', (req, res) => {
  const { cpf, name } = req.body

  const customersAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  )

  if (customersAlreadyExists) {
    return res.status(400).send('usuario ja existe')
  }
  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  })

  return res.status(201).send('usuario criado')
})

app.get('/statement', verifyIfAccountExistsCpf, (req, res) => {
  const { customer } = request
  return res.json(customer.statement)
})

app.post('/deposit', verifyIfAccountExistsCpf, (req, res) => {
  const { description, amount, currency } = req.body

  const { customer } = req

  const statementOperations = {
    description,
    amount,
    createdAt: new Date(),
    type: 'credit',
  }

  customer.statement.push(statementOperations)

  return res.status(201).send({ success: 'deposit done' })
})

app.post('/withdraw', verifyIfAccountExistsCpf, (req, res) => {
  const { amount } = req.body
  const { customer } = req

  const balance = getBalance(customer.statement)

  if(balance < amount) {
    return res.status(400).json({error: "Inssuficient "})
  }

 const statementOperations = {
    amount,
    createdAt: new Date(),
    type: 'debit',
  }


  customer.statement.push(statementOperations)

  return res.status(201).send({ success: 'withdraw done' })
})

app.get('/statement/date', verifyIfAccountExistsCpf, (req, res) => {
  const { customer } = request
  const {date} = req.query

  const dateFormat = new Date(date + " 00:00")

  const statement = customer.statement.filter(statement => {
    statement.createdAt.toDateString() === new Date(dateFormat).toDateString()
  })
  return res.json(statement)
})

app.patch("/account", verifyIfAccountExistsCpf, (req, res) => {
const {name} = req.body
  const {customer} = req

  customer.name = name;

  return response.status(201).send({ success: 'Alterado com sucesso'})
})

app.get("/account", verifyIfAccountExistsCpf, (req, res) => {
  const {customer} = req
  return response.json(customer)
})

app.delete("/account", verifyIfAccountExistsCpf, (req, res) => {
  const {customer} = req

  customers.splice(customer, 1)

  return response.status(200).json(customers)
})

app.get("/balance", verifyIfAccountExistsCpf, (req, res) => {
  const {customer} = req

  const balance = getBalance(customer.statement);

  return response.json(balance)
})

app.listen(3000)
