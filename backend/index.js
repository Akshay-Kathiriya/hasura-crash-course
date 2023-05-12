const express = require('express');
const Sequelize = require('sequelize');
const app = express();

app.use(express.json());

const POSTGRE_CONNECTION_STRING = "postgres://postgres:postgrespassword@localhost:5432/postgres";

const server = app.listen(8000, () => {
    console.log("server listening on port 8000");
});


app.post('/blog_post_event',async (req, res)=>{
    // console.log(req.body);
    let type
    if( req.body.event.op ==='INSERT'){
        type= 'created'
    }
    else if(req.body.event.op ==='UPDATE'){
        if(req.body.event.data.old.is_published===true && req.body.event.data.new.is_published
            ===false){
                type='unpublished'
            }
        else if(req.body.event.data.old.is_published===false && req.body.event.data.new.is_published
            ===true){
                type = 'published'
            }
    }

    // const sequelize = new Sequelize(POSTGRE_CONNECTION_STRING);
    // const blogPostId = req.body.event.data.new.id;
    
    // await sequelize.query("INSERT INTO blog_post_activity(blog_post_id, type) values(:blogPostId, :type);",
    // {
    //     replacements:{
    //         blogPostId,
    //         type:"created"
    //     }
    // })

    if(type){
        const sequelize = new Sequelize(POSTGRE_CONNECTION_STRING, {});
        const blogPostId = req.body.event.data.new.id;
        
        await sequelize.query(
            'INSERT INTO blog_post_activity(blog_post_id, type) values (:blogPostId, :type);',
            {replacements:{
                        blogPostId,
                        type
                    }}
            )
    }

    res.status(200);
})

app.post('/archive_post', async (req, res)=>{
    // console.log(req.body);
    const sequelize = new Sequelize(POSTGRE_CONNECTION_STRING,{});

    const {age_in_second} = req.body.input;
    
    const [result, metadata] = await sequelize.query(
        `UPDATE blog_post SET is_published = false WHERE date < now() - interval '${age_in_second} second';`,
       
    )
        
    res.status(200).json({
        count: metadata.rowCount
    })
})