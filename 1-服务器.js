var mysql=require("mysql")
var express=require("express")
var path=require("path")
var fs=require("fs")
var multer=require("multer")
var ejs=require("ejs")
var bodyParser = require("body-parser")
const { count } = require("console")
var app=express()




app.use(bodyParser.urlencoded({extended:false}))
var client=mysql.createConnection({
    host:'localhost',
    port:"3306",
    user:'root',
    password:'185225',
    database:"online-study"
});
client.connect(function(err){
    if(err){
        //console.log("数据库连接失败")
        console.log('[query] - :'+err)
        return;
    }else{
        console.log("MySQL数据库连接成功")
    }
})




//学生登录
app.get("/login",function(req,res){
    fs.readFile("login.html",function(err,data){
        res.send(data.toString())
    })
})
app.post("/login",function(req,res){
 var sno=req.body.sno//获取用户输入的账号
 var pwd=req.body.pwd//获取用户输入的密码
 console.log("账号:"+sno+"密码:"+pwd)
  client.query("select * from student where sno=? and pwd=?",//在学生表中查询此人
  [sno,pwd],
  function(err,results){
      if(results==0){
          res.send("登录失败，该学生用户不存在！！！")//查询失败
      }else{
          fs.readFile("stu.html",function(err,data){
              res.send(data.toString())
          })
      }
  })







  //学生选课（选课要先登录，谁登录谁选课，为获取登录用户的信息，选课的请求放在app.post("/login")页面里）
//列出所有课程
app.get("/stu-chose",function(req,res){
    fs.readFile("./stu-chose.html",function(err,file){
        client.query("select * from course",function(err,results){
            //console.log(results)
            res.send(ejs.render(file.toString(),{data:results}))
        })
    })
})
app.post("/stu-chose",function(req,res){
     //res.send(req.body)
     client.query("select cno,cname from course where cno=?",//查出课程号和课程名
     [req.body.cno],
      function(err,results){
          var cno=results[0].cno
          var cname=results[0].cname
          client.query("select sname from student where sno=?",[sno],function(err,results){//查出选课人的姓名
              var sname=results[0].sname
              console.log(cno)//所选课程的，课程号
              console.log(cname)//所选课程的，课程名
              console.log(sname)//选课人的名字
              console.log(sno)//选课人的学号
              client.query("insert into puresc values (?,?,?,?)",
              [sno,sname,cno,cname],
              function(err,results){
                  res.send("选课成功！！！")
                   console.log(results)
                //   console.log("增加了记录个数为："+results.affectedRows)
              })
          })

        })
 })

})



//学生查询
app.get("/stu-query-form",function(req,res){
    fs.readFile("stu-query-form.html",function(err,data){
        res.send(data.toString())
    })
})
app.post("/stu-query-form",function(req,res){
 var sno=req.body.sno
 console.log(sno)
  client.query("select * from sc where sno=?",
  [sno],
  function(err,results){
      if(results==0){
          res.send("查询失败，请输入正确的信息！！！")
      }else{
          fs.readFile("stu-query-success.html","utf-8",function(err,data){
              client.query("select * from sc where sno=?",
              [sno],
              function(err,results){
                  res.send(ejs.render(data,{data:results}))
              })
          })
      }
  })
})





//学生注册
app.get("/register",function(req,res){
    fs.readFile("register.html",function(err,data){
        res.send(data.toString())
    })
})
app.post("/register",function(req,res){
 var sno=req.body.sno
 var sname=req.body.sname
 var pwd=req.body.pwd
 var depart=req.body.depart
 var sex=req.body.sex
 var age=req.body.age
client.query("insert into student values(?,?,?,?,?,?)",
[sno,sname,pwd,depart,sex,age],
function(err,results){
console.log(results)
res.redirect("/login")
})
})


//学生课程资料查询
app.get("/stu-study",function(req,res){
    fs.readFile("stu-study.html",function(err,file){
        client.query("select * from coursefile",function(err,results){
            //console.log(results)
            res.send(ejs.render(file.toString(),{data:results}))
        })
    })
})


//学生回答问题
app.get("/stu-answer",function(req,res){
    fs.readFile("stu-answer.html",function(err,file){
        client.query("select * from test",function(err,results){
            //console.log(results)
            res.send(ejs.render(file.toString(),{data:results}))
        })
    })
})
app.post("/stu-answer",function(req,res){
    res.send("答案提交成功！")
})




//管理员登录
app.get("/admin-login",function(req,res){
    fs.readFile("admin-login.html",function(err,data){
        res.send(data.toString())
    })
})
app.post("/admin-login",function(req,res){
 var pwd=req.body.pwd
 console.log("管理员密码:"+pwd)
  client.query("select * from admin where pwd=?",
  [pwd],
  function(err,results){
      if(results==0){
          res.send("登录失败，该管理员不存在！！！")
      }else{
          fs.readFile("admin.html",function(err,data){
              res.send(data.toString())
          })
      }
  })
})



//管理员查询课程
app.get("/admin-listallcourses",function(req,res){
    fs.readFile("admin-listallcourses.html",function(err,file){
        client.query("select * from course",function(err,results){
            //console.log(results)
            res.send(ejs.render(file.toString(),{data:results}))
        })
    })
})


//管理员增加课程
app.get("/admin-courseadd",function(req,res){
    fs.readFile("admin-courseadd.html",function(err,data){
        res.send(data.toString())
    })
})
app.post("/admin-courseadd",function(req,res){
    // res.send(req.body)
     client.query("insert into course values (?,?,?,?,?,?)",
      [req.body.cno,req.body.cname,req.body.credit,req.body.therorytime,req.body.practicetime,req.body.examway],
      function(err,results){
        console.log(results)
        console.log("增加了记录个数为："+results.affectedRows)
        res.redirect("/admin-listallcourses")
 })
})


//管理员删除课程
app.get("/deletebycno",function(req,res){
    var cno=req.query.mycno
    console.log(cno)
    client.query("delete from course where cno=?",
    [cno],
    function(err,results){
        res.redirect("/admin-listallcourses")
    })
})


//管理员更新课程
app.get("/updatebycno/:mycno",(req,res)=>{//箭头函数写法
    var cno=req.params.mycno
    console.log(cno)
    client.query("select * from course where cno=?",[cno],function(err,results){
       console.log(results[0])
       fs.readFile("admin-courseupdate.html",function(err,file){
        res.send(ejs.render(file.toString(),{data:results[0]}))
    })
    })
})
app.post("/admin-courseupdate",(req,res)=>{
    var c=req.body
    console.log(c)
    client.query("update course set cname=?,credit=?,therorytime=?,practicetime=?,examway=? where cno=?",
    [c.cname,c.credit,c.therorytime,c.practicetime,c.examway,c.cno],
    (err,results)=>{
        res.redirect("/admin-listallcourses")
    }
    )
})




//管理员查询学生
app.get("/admin-listallstudents",function(req,res){
    fs.readFile("admin-listallstudents.html",function(err,file){
        client.query("select * from student",function(err,results){
            //console.log(results)
            res.send(ejs.render(file.toString(),{data:results}))
        })
    })
})


//管理员增加学生
app.get("/admin-studentadd",function(req,res){
    fs.readFile("admin-studentadd.html",function(err,data){
        res.send(data.toString())
    })
})
app.post("/admin-studentadd",function(req,res){
    var s=req.body
     client.query("insert into student values (?,?,?,?,?,?)",
      [s.sno,s.sname,s.pwd,s.depart,s.sex,s.age],
      function(err,results){
        console.log(results)
        console.log("增加了记录个数为："+results.affectedRows)
        res.redirect("/admin-listallstudents")
 })
})


//管理员删除学生
app.get("/deletebysno",function(req,res){
    var sno=req.query.mysno
    console.log(sno)
    client.query("delete from student where sno=?",
    [sno],
    function(err,results){
        res.redirect("/admin-listallstudents")
    })
})


//管理员更新学生
app.get("/updatebysno/:mysno",(req,res)=>{//箭头函数写法
    var sno=req.params.mysno
    console.log(sno)
    client.query("select * from student where sno=?",[sno],function(err,results){
       console.log(results[0])
       fs.readFile("admin-studentupdate.html",function(err,file){
        res.send(ejs.render(file.toString(),{data:results[0]}))
    })
    })
})
app.post("/admin-studentupdate",(req,res)=>{
    var s=req.body
    console.log(s)
    client.query("update student set sname=?,pwd=?,depart=?,sex=?,age=? where sno=?",
    [s.sname,s.pwd,s.depart,s.sex,s.age,s.sno],
    (err,results)=>{
        res.redirect("/admin-listallstudents")
    }
    )
})



//管理员查询成绩
app.get("/admin-listallgrades",function(req,res){
    fs.readFile("admin-listallgrades.html",function(err,file){
        client.query("select * from grade",function(err,results){
            //console.log(results)
            res.send(ejs.render(file.toString(),{data:results}))
        })
    })
})


//管理员增加成绩
app.get("/admin-gradeadd",function(req,res){
    fs.readFile("admin-gradeadd.html",function(err,data){
        res.send(data.toString())
    })
})
app.post("/admin-gradeadd",function(req,res){
    var g=req.body
     client.query("insert into grade values (?,?,?,?,?,?)",
      [g.sno,g.sname,g.havecredit,g.passnum,g.failnum,g.avgsort],
      function(err,results){
        console.log(results)
        console.log("增加了记录个数为："+results.affectedRows)
        res.redirect("/admin-listallgrades")
 })
})


//管理员删除成绩
app.get("/deletegradebysno/:mysno",function(req,res){
    var sno=req.params.mysno
    console.log(sno)
    client.query("delete from grade where sno=?",
    [sno],
    function(err,results){
        res.redirect("/admin-listallgrades")
    })
})


//管理员更新成绩
app.get("/updategradebysno/:mysno",(req,res)=>{//箭头函数写法
    var sno=req.params.mysno
    console.log(sno)
    client.query("select * from grade where sno=?",[sno],function(err,results){
       console.log(results[0])
       fs.readFile("admin-gradeupdate.html",function(err,file){
        res.send(ejs.render(file.toString(),{data:results[0]}))
    })
    })
})
app.post("/admin-gradeupdate",(req,res)=>{
    var s=req.body
    console.log(s)
    client.query("update grade set sname=?,havecredit=?,passnum=?,failnum=?,avgsort=? where sno=?",
    [s.sname,s.havecredit,s.passnum,s.failnum,s.avgsort,s.sno],
    (err,results)=>{
        res.redirect("/admin-listallgrades")
    }
    )
})






//管理员上传学习资料
let objMulter = multer({ dest: "./1-public/upload" }); 
//实例化multer，传递的参数对象，dest表示上传文件的存储路径
app.use(objMulter.any())//any表示任意类型的文件
// app.use(objMulter.image())//仅允许上传图片类型

app.use(express.static("./1-public"));//将静态资源托管，这样才能在浏览器上直接访问预览图片或则html页面


app.get("/admin-upload",(req,res)=>{//箭头函数写法
    fs.readFile("admin-upload.html",function(err,data){
        res.send(data.toString())
    })
})

app.post("/admin-upload", (req, res) => {
    let oldName = req.files[0].path;//获取名字
    //给新名字加上原来的后缀
    let newName = req.files[0].path + path.parse(req.files[0].originalname).ext;
    fs.renameSync(oldName, newName);//改图片的名字
      var url="http://127.0.0.1:2000/upload/" +req.files[0].filename +path.parse(req.files[0].originalname).ext//该文件的预览路径
      //console.log(url)
      client.query("insert into coursefile values (?)",[url],function(err,results ){
        res.send("课程资料上传成功！")
      })
    });



//管理员发布测验
app.get("/admin-test",(req,res)=>{//箭头函数写法
    fs.readFile("admin-test.html",function(err,data){
        res.send(data.toString())
    })
})
app.post("/admin-test", (req, res) => {
var question=req.body.question 
client.query("insert into test values (?)",[question],function(err,results){
    console.log(results)
})
});




  
app.listen(2000,function(){
    console.log("服务器监听地址：http://127.0.0.1:2000")
})   
  