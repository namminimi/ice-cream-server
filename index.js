//express 가져오기
const express = require("express");
//cors 가져오기
const cors = require("cors");
//mysql 가져오기
const mysql = require("mysql");
//multer 가져오기
const multer = require("multer");
//bcrypt가져오기
const bcrypt = require("bcrypt");
//암호화 글자수
const saltRounds = 10;
//env 가져우기
const dotenv = require("dotenv");

//서버생성
const app = express();
//프로세서 주소 포트번호 지정
const port = process.env.PORT || 8003;

app.use(cors());

app.use(express.json());

dotenv.config();

//upload 폴더를 클라이언트에 접근가능
app.use("/upload", express.static("upload"));

//storage 생성
const storage = multer.diskStorage({
  destination: (req, file, cd) => {
    cd(null, "upload/products/");
  },
  filename: (req, file, cd) => {
    const newFilename = file.originalname;
    cd(null, newFilename);
  },
});
//upload 객체 생성
const upload = multer({ storage: storage });

//upload 경로로 post 요청했을 시 응답 구현
app.post("/upload", upload.single("file"), (req, res) => {
  res.send({
    imgUrl: req.file.filename,
  });
});

const conn = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DATABASE,
});

// 선연결
conn.connect();

//회원가입 요청
app.post("/join", async (req, res) => {
  console.log(req);
  const mytextpass = req.body.m_password;
  let myPass = "";
  const {
    m_name,
    m_password,
    m_id,
    m_nickname,
    m_birth,
    m_gender,
    m_phone,
    m_add1,
    m_add2,
    m_comnick,
    m_passwordCh,
  } = req.body;
  console.log(11111);
  if (mytextpass != "" && mytextpass != undefined) {
    console.log(113333);
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(mytextpass, salt, function (err, hash) {
        myPass = hash;
        conn.query(
          `insert into member(m_name, m_password, m_id, m_nickname, m_birth, m_gender, m_phone, m_add1, m_add2, m_comnick, m_passwordch) values('${m_name}','${myPass}','${m_id}','${m_nickname}','${m_birth}','${m_gender}','${m_phone}','${m_add1}','${m_add2}','${m_comnick}','${m_passwordCh}')`,
          (err, result, fields) => {
            console.log(result);
            if (result) {
              console.log("회원가입성공");
              res.send("등록되었습니다");
            }
            console.log(err);
          }
        );
      });
    });
  } else {
    console.log("에러발생");
  }
});

//아이디 중복 확인
app.get("/check/:m_id", async (req, res) => {
  const { m_id } = req.params;
  conn.query(
    `select * from member where m_id='${m_id}'`,
    (err, result, fields) => {
      if (result) {
        console.log(result);
        res.send(result[0]);
      }
      console.log(err);
    }
  );
});

//닉네임 중복 확인
app.get("/check/:m_nickname", async (req, res) => {
  const { m_nickname } = req.params;
  conn.query(
    `select * from member where m_nickname='${m_nickname}'`,
    (err, result, fields) => {
      if (result) {
        console.log(result);
        res.send(result[0]);
      }
      console.log(err);
    }
  );
});

//등록된 추천 닉네임 확인
app.get("/check/:m_comnick", async (req, res) => {
  const { m_comnick } = req.params;
  conn.query(
    `select * from member where m_id='${m_comnick}'`,
    (err, result, fields) => {
      if (result) {
        console.log(result);
        res.send(result[0]);
      }
      console.log(err);
    }
  );
});

//로그인 요청
app.post("/login", async (req, res) => {
  const { logId, logPass } = req.body;
  conn.query(
    `select * from member where m_id = '${logId}'`,
    (err, result, fields) => {
      console.log(result);
      if (result != undefined && result[0] != undefined) {
        bcrypt.compare(
          logPass,
          result[0].m_password,
          function (err, newPassword) {
            console.log(newPassword);
            console.log(logPass);
            if (newPassword) {
              console.log("로그인 성공");
              console.log(result);
              res.send(result);
            }
          }
        );
      } else {
        console.log("데이터가 없습니다.");
        console.log("로그인 실패");
        res.send("로그인 실패");
      }
    }
  );
});

//아이디찾기
app.post("/findId", async (req, res) => {
  const { findName, findPhone } = req.body;
  conn.query(
    `select * from member where m_name= '${findName}' and m_phone ='${findPhone}'`,
    (err, result, fields) => {
      if (result != undefined && result[0] != undefined) {
        console.log(result);
        res.send(result);
      } else {
        console.log(err);
        console.log("조회불가");
        res.send("조회불가");
      }
    }
  );
});

//비밀번호 찾기
app.post("/findPass", async (req, res) => {
  const { findId, findName, findPhone } = req.body;
  conn.query(
    `select * from member where m_name= '${findName}' and m_phone ='${findPhone}' and m_Id = '${findId}'`,
    (err, result, fields) => {
      if (result != undefined && result[0] != undefined) {
        console.log(result);
        res.send(result);
      } else {
        console.log(err);
        console.log("조회불가");
        res.send("조회불가");
      }
    }
  );
});

//비밀번호 변경하기
app.patch("/editpass", async (req, res) => {
  const { newPass, userId } = req.body;
  const mytextpass = newPass;
  console.log(newPass);
  let myPass = "";
  if (mytextpass != "" && mytextpass != undefined) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(mytextpass, salt, function (err, hash) {
        myPass = hash;
        console.log(myPass);
        console.log(userId);
        conn.query(
          `update member set m_password='${myPass}' where m_id='${userId}'`,
          (err, result, fields) => {
            if (result) {
              res.send("등록되었습니다");
              console.log(result);
            }
            console.log(err);
          }
        );
      });
    });
  }
});

//상품 리스트
app.get("/products", (req, res) => {
  conn.query("select * from products", (err, result, fields) => {
    if (result) {
      console.log(result);
      res.send(result);
    }
    console.log(err);
  });
});

//상품 상세보기
app.get("/productDetails/:no", (req, res) => {
  const { no } = req.params;
  conn.query(
    `select * from products where p_no=${no}`,
    (err, result, fields) => {
      if (result) {
        console.log(result);
        res.send(result);
      }
      console.log(err);
    }
  );
});

//검색하기
app.get("/search/:title", async (req, res) => {
  const { title } = req.params;
  conn.query(
    `select * from products where p_title like '%${title}%'`,
    (err, result, fields) => {
      if (result) {
        console.log(result);
        res.send(result);
      }
      console.log(err);
    }
  );
});

//브랜드별 리스트
app.get("/brand", async (req, res) => {
  conn.query(`select * from brandList`, (err, result, fields) => {
    if (result) {
      console.log(result);
      res.send(result);
    }
    console.log(err);
  });
});

//브랜드 선택
app.get("/selectBr/:brand", async (req, res) => {
  const { brand } = req.params;
  if (brand === "전체") {
    conn.query(`select * from products`, (err, result, fields) => {
      if (result) {
        console.log(result);
        res.send(result);
      }
      console.log(err);
    });
  } else
    conn.query(
      `select * from products where p_brand='${brand}'`,
      (err, result, fields) => {
        if (result) {
          console.log(result);
          res.send(result);
        }
        console.log(err);
      }
    );
});
//공지사항 요청
app.get("/notice", async (req, res) => {
  conn.query(
    `select * from notice order by w_no desc`,
    (err, result, fields) => {
      if (result) {
        //console.log(result)
        res.send(result);
      }
      console.log(err);
    }
  );
});

//공지사항 글쓰기
app.post("/writeNotice", async (req, res) => {
  const { w_title, w_desc, w_date, w_username } = req.body;
  console.log(req.body);
  conn.query(
    `insert into notice(w_title, w_desc, w_date,w_username) values('${w_title}','${w_desc}','${w_date}','${w_username}')`,
    (err, result, fields) => {
      console.log(result);
      if (result) {
        console.log(result);
        res.send(result);
      }
      console.log(err);
    }
  );
});

//공지사항 상세보기
app.get("/notice/:no", async (req, res) => {
  const { no } = req.params;
  conn.query(`select * from notice where w_no=${no}`, (err, result, fields) => {
    if (result) {
      //console.log(result)
      res.send(result);
    }
    console.log(err);
  });
});

//공지사항 수정
app.patch("/editNotice", async (req, res) => {
  const { w_title, w_username, w_date, w_desc, w_no } = req.body;
  console.log(req.body);
  console.log(w_no);
  conn.query(
    `update notice set w_title='${w_title}', w_desc='${w_desc}', w_username='${w_username}',w_date='${w_date}' where w_no= '${w_no}'`,
    (err, result, fields) => {
      if (result) {
        //console.log(result)
        res.send(result);
      }
      console.log(err);
    }
  );
});

//공지사항 페이지 이동
app.get("/editNotice/:no", async (req, res) => {
  const { no } = req.params;
  conn.query(`select * from notice where w_no=${no}`, (err, result, fields) => {
    if (result) {
      //console.log(result)
      res.send(result);
    }
    console.log(err);
  });
});

//공지사항 글 삭제
app.delete("/deleteNotice/:no", async (req, res) => {
  const { no } = req.params;
  conn.query(
    `delete from notice where w_no = '${no}'`,
    (err, result, fields) => {
      if (result) {
        res.send("삭제되었습니다.");
        console.log(result);
      }
      console.log(err);
    }
  );
});

//장바구니 담기요청
app.post("/carts", async (req, res) => {
  const {
    c_userId,
    c_title,
    c_price,
    c_taste,
    c_amount,
    c_img,
    c_point,
    c_brand,
  } = req.body;
  conn.query(
    `insert into cart(c_userId, c_title,c_price, c_taste, c_amount, c_img, c_point,c_brand) values('${c_userId}','${c_title}','${c_price}','${c_taste}','${c_amount}','${c_img}','${c_point}','${c_brand}')`,
    (err, result, fields) => {
      if (result) {
        console.log(result);
        res.send(result);
      }
      console.log(err);
    }
  );
});
//로그인 아이디 장바구니 조회
app.get("/sendCart/:id", async (req, res) => {
  const { id } = req.params;
  conn.query(
    `select * from cart where c_userid='${id}'`,
    (err, result, fields) => {
      if (result) {
        console.log(result);
        res.send(result);
      }
      console.log(err);
    }
  );
});

// 장바구니 선택항목 삭제
app.delete("/delCart/:num", async (req, res) => {
  const { num } = req.params;
  console.log(num);
  conn.query(`delete from cart where c_no=${num}`, (err, result, fields) => {
    if (result) {
      console.log("삭제되었습니다.");
      res.send("삭제되었습니다");
    }
    console.log(err);
  });
});

//회원정보 수정 페이지 이동
app.get("/personal/:id", async (req, res) => {
  const { id } = req.params;
  conn.query(
    `select * from member where m_id='${id}'`,
    (err, result, fields) => {
      if (result) {
        console.log(result);
        res.send(result[0]);
      }
      console.log(err);
    }
  );
});
//회원정보 수정 요청
app.post("/finalCheck", async (req, res) => {
  const { ok_name, ok_nickname, ok_phone, ok_address1, ok_address2, ok_id } =
    req.body;
  console.log(req.body);
  conn.query(
    `update member set m_name='${ok_name}', m_nickname='${ok_nickname}',m_phone='${ok_phone}',m_add1='${ok_address1}',m_add2='${ok_address2}' where m_id='${ok_id}'`,
    (err, result, fields) => {
      if (result) {
        console.log(result);
        res.send("수정완료");
      }
      console.log(err);
    }
  );
});

//회원 탈퇴 전 정보 조회
app.post("/end", async (req, res) => {
  const { userId, password } = req.body;
  conn.query(
    `select * from member where m_id='${userId}' and m_passwordch='${password}'`,
    (err, result, fields) => {
      if (result) {
        console.log(result);
        res.send(result[0]);
      }
      console.log(err);
    }
  );
});
//회원 탈퇴
app.delete("/deleteMember/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log(1111);
  conn.query(
    `delete from member where m_id='${userId}'`,
    (err, result, fields) => {
      if (result) {
        console.log(result);
        res.send(result);
      }
      console.log(err);
    }
  );
});
//상품 등록
app.post("/addIce", async (req, res) => {
  const {
    p_title,
    p_dsce,
    p_img1,
    p_img2,
    p_img3,
    p_img4,
    p_brand,
    p_taste,
    p_price,
    p_amount,
    p_point,
  } = req.body;
  console.log(req.body);
  let img2 = p_img2;
  let img3 = p_img3;
  let img4 = p_img4;
  if (p_img2 === "" && p_img3 === "" && p_img4 === "") {
    img2 = null;
    img3 = null;
    img4 = null;
    conn.query(
      `insert into products(p_title, p_dsce, p_img1, p_img2, p_img3, p_img4, p_brand, p_taste, p_price, p_amount, p_point) values('${p_title}', '${p_dsce}', '${p_img1}', ${img2}, ${img3}, ${img4}, '${p_brand}', '${p_taste}', '${p_price}', '${p_amount}', '${p_point}')`,
      (err, result, fields) => {
        if (result) {
          console.log(result);
          res.send("등록되었습니다.");
        }
        console.log(err);
      }
    );
  } else if (p_img3 === "" && p_img4 === "") {
    img3 = null;
    img4 = null;
    conn.query(
      `insert into products(p_title, p_dsce, p_img1, p_img2, p_img3, p_img4, p_brand, p_taste, p_price, p_amount, p_point) values('${p_title}', '${p_dsce}', '${p_img1}', '${img2}', ${img3}, ${img4}, '${p_brand}', '${p_taste}', '${p_price}', '${p_amount}', '${p_point}')`,
      (err, result, fields) => {
        if (result) {
          console.log(result);
          res.send("등록되었습니다.");
        }
        console.log(err);
      }
    );
  } else if (p_img4 === "") {
    img4 = null;
    conn.query(
      `insert into products(p_title, p_dsce, p_img1, p_img2, p_img3, p_img4, p_brand, p_taste, p_price, p_amount, p_point) values('${p_title}', '${p_dsce}', '${p_img1}', '${img2}', '${img3}', ${img4}, '${p_brand}', '${p_taste}', '${p_price}', '${p_amount}', '${p_point}')`,
      (err, result, fields) => {
        if (result) {
          console.log(result);
          res.send("등록되었습니다.");
        }
        console.log(err);
      }
    );
  } else {
    conn.query(
      `insert into products(p_title, p_dsce, p_img1, p_img2, p_img3, p_img4, p_brand, p_taste, p_price, p_amount, p_point) values('${p_title}', '${p_dsce}', '${p_img1}', '${img2}', '${img3}', '${img4}', '${p_brand}', '${p_taste}', '${p_price}', '${p_amount}', '${p_point}')`,
      (err, result, fields) => {
        if (result) {
          console.log(result);
          res.send("등록되었습니다.");
        }
        console.log(err);
      }
    );
  }
});

app.listen(port, () => {
  console.log("서버가 동작하고 있습니다.");
});
