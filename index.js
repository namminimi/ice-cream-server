//express 가져오기
const express = require('express')
//cors 가져오기
const cors = require('cors')
//mysql 가져오기
const mysql = require('mysql')
//multer 가져오기
const multer = require('multer')
//bcrypt가져오기
const bcrypt = require('bcrypt')
//암호화 글자수
const saltRounds = 10;

//서버생성
const app = express();
//프로세서 주소 포트번호 지정
const port = 8003;

app.use(cors());

app.use(express.json());

const conn = mysql.createConnection({
    host: "hera-database.c6v9c00axeyk.ap-northeast-2.rds.amazonaws.com",
    user: "admin",
    password: "alstjq12$!!",
    port: "3306",
    database: "ice-cream"
})

// 선연결
conn.connect();


app.listen(port, ()=>{
    console.log("서버가 동작하고 있습니다.")
})
