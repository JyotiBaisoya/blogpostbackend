const express = require('express');
const db = require("./models");

const {userRouter} = require("./routes/userroute");
const postRouter = require('./routes/postroute');
const { commentRouter } = require('./routes/commentroute');
const cors = require("cors");




const app=express();
app.use(cors());
 
app.use(express.json());
app.use("/user",userRouter);
app.use('/posts', postRouter);
app.use(commentRouter);







db.sequelize.sync().then(()=>{
    app.listen(4500,()=>{
        console.log("server started")
    })
})

