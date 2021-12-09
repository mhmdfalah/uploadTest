const { json } = require('express')
const express = require('express')
const bodyParser = require('body-parser')
var multer = require('multer');
const imagerouter = require('./src/image/image.routes')
const app =  express()
const port = 8082
app.use(bodyParser.json())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static('uploads'));

app.use(imagerouter);


app.get('/',(req,res) => {
    return res.json({msg:"hi this is upload test for #HIRNS developer role :)"})
})


app.listen(port,()=> console.log(`runing at http://localhost:${port}`))