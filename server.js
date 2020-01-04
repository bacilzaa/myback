var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "test"
});




app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.set('Access-Control-Allow-Origin', '*')
  next();
});
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

app.post("/data",(req,res)=>{
  console.log(req.body)
  var sql = `SELECT * FROM work WHERE account_id = ${req.body.account_id}`
  var sqli = `SELECT sum(price)as recieve FROM work WHERE account_id = ${req.body.account_id} AND type LIKE 'receive'`
  var sqlj = `SELECT sum(price)as spend FROM work WHERE account_id = ${req.body.account_id} AND type LIKE 'spend'`
  con.query(sql,(err,result)=>{
    if(err) throw err;
    con.query(sqli,(erri,resulti)=>{
      con.query(sqlj,(errj,resultj)=>{
        res.send({account:result,money:{receive:resulti[0].recieve,spend:resultj[0].spend,remain:resulti[0].recieve-resultj[0].spend}})
      })
    })
    console.log(result);
    
  })
  //res.send(req.body)
})



app.get("/account", function (req, res) {
  var sql = "SELECT * FROM account ORDER BY id DESC";
  con.query(sql, (err, result) => {
    if (err) throw err;
    //console.log(result);
    res.send(result)
  })
})
app.post("/account", function (req, res) {
  console.log(req.body.account)
  var sql = `INSERT INTO account (id, account) VALUES (NULL, '${req.body.account}')`;
  con.query(sql, (err, result) => {
    if (err) {
      if (err.errno == 1062) {
        res.send({ Message: 'ชื่อซ้ำ' })
        console.log("add success")
      }
    }
    else {
      var sql1 = `SELECT * FROM account WHERE account = '${req.body.account}'`;
      con.query(sql1, (err, result) => {
        if (err) throw err;
        console.log("call success")
        res.send(result[0])
      })
    }
  })
})
app.post("/run", function (req, res) {
  console.log(req.body)
  if(req.body.id == null){
  var sql = `INSERT INTO work (id, account_id, type, price, detail, created, updated) VALUES (NULL, '${req.body.account}', '${req.body.type}', '${req.body.price}', '${req.body.detail}',NOW(),NOW())`;
  con.query(sql, (err, result) => {
    
    if (err) throw err;
    console.log("add success")
    res.send({ Message: "add success2" })
  })
  }else{
    var sqli =`UPDATE work SET type='${req.body.type}',price=${req.body.price},detail='${req.body.detail}',updated=NOW() WHERE id = ${req.body.id}`
    con.query(sqli,(err,result)=>{
      if(err) throw err;
      console.log("update success")
      res.send({ Message: "อัพเดทสำเร็จ" })
    })
  }
})

app.post("/delete",(req,res)=>{
  console.log(req.body)
  var sql = `DELETE FROM work WHERE id = ${req.body.id}`
  con.query(sql,(err,result)=>{
    if(err) throw err;
    console.log("Delete success")
    res.send({Message:"ลบข้อมูลเรียบร้อย"})
  })
})

app.set('port',(process.env.PORT || 3000))
app.listen(app.get('port'),()=>{
  console.log("Server starto",app.get('port'))
});
module.exports = app;

