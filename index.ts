import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, query, validationResult } from 'express-validator'

const app = express()
app.use(bodyParser.json())
app.use(cors())

const PORT = process.env.PORT || 3000
const SECRET = "SIMPLE_SECRET"

interface JWTPayload {
  username: string;
  password: string;
}
let users :data[] =[];  
interface data{
  username:string
  password:string
  firstname:string
  lastname:string
  balance:number
}
app.post('/login',
  (req, res) => {

    const { username, password } = req.body
    // Use username and password to create token.
    const user = users.find(user => user.username === username)
    if (!user) {
      res.status(400)
      res.json({ message: 'Invalid username or password' })
      return
    }
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(400)
      res.json({ message: 'Invalid username or password' })
      return
    }
    const token = jwt.sign({username: user.username }, SECRET)
    res.status(200)
    res.json({ 
      message:'Login successfully',
      token: token 
    })
  })

app.post('/register', (req, res) => {
    const { username, password, firstname, lastname, balance } = req.body
    const haveuser = users.find(user=>user.username===username)
    if (haveuser) {
      res.status(400)
      res.json({ message: 'Username is already in used' })
      return
    }else{
      const user :data = req.body  
      const hashPassword = bcrypt.hashSync(password, 10)
      users.push({
        ...user,
        password:hashPassword,
      })

      res.status(200)
      res.json({ message: 'Register successfully' })
    }
      
})

app.get('/balance', (req, res) => {
    const token = req.query.token as string
    try {
      const { username } = jwt.verify(token, SECRET) as JWTPayload
      const balance = users.find(user=>user.username===username)?.balance
      res.status(200)
      res.json({
        name:username,
        balance:balance
      })
    }
    catch (e) {
      //response in case of invalid token
      res.json({
        message:'Invalid token'
      })
    }
  })

app.post('/deposit', body('amount').isInt({ min: 1 }),(req, res) => {
    const token = req.headers.authorization
    const amount = req.body.amount  as number
    //Is amount <= 0 ?
    if(amount<=0){
      if (!validationResult(req).isEmpty())
        return res.status(400).json({ message: "Invalid data" })
      return res.status(400).json({ message: "Invalid data" })
    }
    if (!token) {
      res.status(401)
      res.json({ message: 'Invalid token'})
      return
    }
    res.status(200)
    const { username } = jwt.verify(token, SECRET) as JWTPayload
    const balance = users.find(user=>user.username===username)?.balance as number
    //const newbalance  = balance.+amount  as number
    //const user = users.find(user=>user.username===username)
    const newbalance = balance + amount
    res.json({ 
      message: 'Deposit sucessfully',
      balance: newbalance
    })
})

app.post('/withdraw',(req, res) => {
  const token = req.headers.authorization
    const amount = req.body.amount  as number
    //Is amount <= 0 ?
    if(amount<=0){
      if (!validationResult(req).isEmpty())
        return res.status(400).json({ message: "Invalid data" })
      return res.status(400).json({ message: "Invalid data" })
    }
    if (!token) {
      res.status(401)
      res.json({ message: 'Invalid token'})
      return
    }
    
    
    const { username } = jwt.verify(token, SECRET) as JWTPayload
    const balance = users.find(user=>user.username===username)?.balance as number
    //const newbalance  = balance.+amount  as number
    //const user = users.find(user=>user.username===username)
    const newbalance = balance - amount
    if(newbalance<0){
      res.status(400)
      res.json({
        message:'Invalid data'
      })
      return
    }
    
    res.status(200)
    res.json({ 
      message: 'Withdraw sucessfully',
      balance: newbalance
    })

})

app.delete('/reset', (req, res) => {

  //code your database reset here
  users =[]
  return res.status(200).json({
    message: 'Reset database successfully'
  })
})

app.get('/me', (req, res) => {
  res.json({
    firstname:'Wadeepat',
    lastname: 'Lertwatanwanich',
    code: '620610806',
    gpa :3.82
  })
})

app.get('/demo', (req, res) => {
  return res.status(200).json({
    message: 'This message is returned from demo route.'
  })
})

app.listen(PORT, () => console.log(`Server is running at ${PORT}`))