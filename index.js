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

//회원가입 요청
app.post("/join", async (req, res)=> {
    console.log(req)
    const mytextpass = req.body.m_password;
    let myPass = "";
    const {m_name, m_password, m_id, m_nickname, m_birth, m_gender, m_phone, m_add1, m_add2, m_comnick} = req.body
    console.log(11111)
    if(mytextpass != "" && mytextpass != undefined){
        console.log(113333)
        bcrypt.genSalt(saltRounds, function(err, salt){
            bcrypt.hash(mytextpass, salt, function(err, hash){
                myPass = hash;
                conn.query(`insert into member(m_name, m_password, m_id, m_nickname, m_birth, m_gender, m_phone, m_address, m_comnick) values('${m_name}','${myPass}','${m_id}','${m_nickname}','${m_birth}','${m_gender}','${m_phone}','${m_add1}${m_add2}','${m_comnick}')`
                , (err, result, fields)=>{
                    console.log(result)
                    if(result){
                        console.log("회원가입성공")
                        res.send("등록되었습니다")
                    }
                    console.log(err)
                })
            })
        })
    }else{
        console.log("에러발생")
    }
})

//아이디 중복 확인
app.get("/check/:m_id", async (req, res) => {
    const {m_id} = req.params;
    conn.query(`select * from member where m_id='${m_id}'`, (err, result, fields) => {
        if(result){
            console.log(result)
            res.send(result[0])
        }
        console.log(err)
    })
})

//닉네임 중복 확인
app.get("/check/:m_nickname", async (req, res) => {
    const {m_nickname} = req.params;
    conn.query(`select * from member where m_nickname='${m_nickname}'`, (err, result, fields) => {
        if(result){
            console.log(result)
            res.send(result[0])
        }
        console.log(err)
    })
})

//등록된 추천 닉네임 확인
app.get("/check/:m_comnick", async (req, res) => {
    const {m_comnick} = req.params;
    conn.query(`select * from member where m_id='${m_comnick}'`, (err, result, fields) => {
        if(result){
            console.log(result)
            res.send(result[0])
        }
        console.log(err)
    })
})


//로그인 요청
app.post("/login", async (req, res)=> {
    const {logId, logPass} = req.body
    conn.query(`select * from member where m_id = '${logId}'`, 
    (err, result, fields)=> {
        console.log(result)
        if(result != undefined && result[0] != undefined){
            bcrypt.compare(logPass, result[0].m_password, function(err, newPassword){
                console.log(newPassword)
                console.log(logPass)
                if(newPassword){
                    console.log("로그인 성공")
                    console.log(result)
                    res.send(result)
                }
            })
        }else {
            console.log("데이터가 없습니다.")
            console.log('로그인 실패')
            res.send("로그인 실패")
        }
    })
})

//아이디찾기
app.post("/findId", async (req, res) => {
    const {findName, findPhone} = req.body
    conn.query(`select * from member where m_name= '${findName}' and m_phone ='${findPhone}'`,
    (err, result, fields) =>{
        if(result != undefined && result[0] != undefined){
            console.log(result)
            res.send(result)
        }else {
            console.log(err)
            console.log("조회불가")
            res.send("조회불가")
        }
    })
})


app.listen(port, ()=>{
    console.log("서버가 동작하고 있습니다.")
})
