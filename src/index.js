const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');   // for configuration filter
const sharp = require('sharp');     // for resize
const bcrypt = require('bcrypt');
const cors = require('cors');

const User = require('./models/user');  // const User = mongoose.model('User', userSchema)
const Task = require('./models/task');  // const Task = mongoose.model('Task', taskSchema);

// const URL = 'mongodb://127.0.0.1:27017/jc-mongoose'
// jc-mongoose = nama database
mongoose.connect('mongodb+srv://rein96:rein96@to-do-list-reactmongoose-0jgcu.mongodb.net/reinhart-todolist-react-mongoose?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    // ensureIndex() -> default mongoose (deprecated )  ----> now recommended version: createIndex()
    useCreateIndex: true
})

// mongoose.connect('mongodb+srv://rein96:rein96@to-do-list-reactmongoose-0jgcu.mongodb.net/reinhart-todolist-react-mongoose?retryWrites=true&w=majority', {
// mongoose.connect('mongodb://127.0.0.1:27017/jc-mongoose', {
    // useNewUrlParser: true,
    // ensureIndex() -> default mongoose (deprecated )  ----> now recommended version: createIndex()
    // useCreateIndex: true
// })

// mongoose gak perlu function callback (parameter ke3 di mongoDB)

const app = express();

// give access port to heroku or 2019 as localhost
const port = process.env.PORT || 2019;

// To prevent CORS ERROR when front-end do http request( axios )
app.use(cors())

// JSON format
app.use(express.json())

// Testing API (recommended when deploying to heroku or other)
app.get('/', (req,res) => {
    res.send("<h1> API berhasil di Jalankan (index.js) </h1>");
})

                            /* USER */
/////////////////////////////////////////////////////////////// POST
// REGISTER ONE USER (CREATE)
app.post('/users/input', (req,res) => {

    // Inputted by user
    const { name, email, age, password } = req.body

    const data_name = name;
    const data_email = email;
    const data_password = password;
    const data_age = age;

    // New model to create to database
    const person = new User({   // const User = mongoose.model('User', userSchema)
        // property from database : req.body.INPUTTEDUSER
        name: data_name,
        email: data_email,
        password: data_password,
        age: data_age
    })

    /* 
        // MIDDLEWARE FROM USER.JS
        // userSchema.pre('save') -> user.password = await bcrypt.hash(user.password, 8);
        // this = person { ... }
    */


    person.save().then( resres => {
        res.send(resres);
    }).catch( (err) => {
        // res.send(err);
        res.send(err.message);      // To display error when POSTMAN failed request
    } )

})

// Konfigurasi multer a.k.a upload gambar
const upload = multer({
    limits: {
        fileSize: 1000000,   // 1 juta bytes
    },
    fileFilter(req, file, cb) {     //cb = callback
        let boleh = file.originalname.match(/\.(jpg|jpeg|png)$/)    //true or false

        if(!boleh) {        //jika tidak match .jpg .jpeg .png
            cb( new Error('Please upload file dengan ext .jpg .png .jpeg') )
        }

        // jika match
        cb(undefined, true)
    }
})

// CREATE AVATAR
app.post('/users/:id/avatar', upload.single('avatar') , async (req,res) => {    //single = single file

    const data_id = req.params.id

    try {
        var buffer = await sharp(req.file.buffer).resize({ width: 250 }).png().toBuffer()     //semua file di resize dan diubah menjadi .png, lalu ke buffer
        var user = await User.findById(data_id)

        // simpan buffer tadi di property avatar milik user
        user.avatar = buffer

        await user.save()
        res.send('Upload berhasil !')

    } catch (err) {
        console.log(err.message + 'CATCHHHHH')
    }
})


// LOGIN USER
app.post('/users/login', async (req, res) => {
    const inputEmail = req.body.email
    const inputPassword = req.body.password

    try {
        // User.loginWithEmail -> from model user.js
        const hasil = await User.loginWithEmail(inputEmail, inputPassword)
        console.log('hasil LOGIN USER:')
        console.log(hasil);
        res.send(hasil)
        
    } catch (err) {
        // err -> yang kita throw dari User.loginWithEmail (User.js)
        res.send(err);
    }
})


/*
// Create User model (name -> field)
const User = mongoose.model('User', {
    name: String,
    age : Number
})

// Create a User
const person = new User({ name: 'Titan', age: 99 })

// save to database
person.save().then( () => console.log('Berhasil input user ke database') )   
*/



/////////////////////////////////////////////////// GET
// READ ONE USER
app.get('/users/:id', (req,res) => {
    const data_id = req.params.id

    User.findById(data_id)
    .then( resres => {
        res.send(resres);
    } )
})

// GET ALL USERS
app.get('/users', (req,res) => {

    User.find()
    .then( resres => {
        res.send(resres);
    } )
})

// GET AVATAR
app.get('/users/:id/avatar', async (req,res) => {
    // get user, get photo
    const user = await User.findById(req.params.id)

    // Kalo tidak ada user || ada user tapi gak ada avatar
    if ( !user || !user.avatar ) {
        throw new Error('Foto / User tidak ada')
    }

    // Set HEADER to image/png ( not application/json [default] )
    res.set('Content-Type', 'image/png')
    res.send(user.avatar)

})




////////////////////////////////////////////////////// UPDATE / PATCH
// UPDATE PROFILE BY ID
// Name, email, age, password
app.patch('/users/:id', upload.single('avatar') , async (req,res) => {

    // case nya : ganti name, email, age, TANPA password
    // req.body masih lengkap ada passwordnya
    // req.body { name, email, age, password }
    let arrayBody = Object.keys(req.body)
    arrayBody.forEach( key => {
        if(!req.body[key]) {
            delete req.body[key]
        }
    })
    // setelah forEach ini
    // req.body { name, email, age }
    
    arrayBody = Object.keys(req.body)
    // arrayBody = { name, email, age }

    const data_id = req.params.id;
    // const data_name = req.body.name;
    // const data_email = req.body.email;
    // const data_age = req.body.age;
    // const data_password = req.body.password;

    const user = await User.findById(data_id)
    // user : { _id, name, password, email, age }
    console.log(user)

    if(!user) {
        return res.send('User tidak ditemukan')
    }

    // update user
    arrayBody.forEach(key => {
        user[key] = req.body[key]
    })

    var buffer = await sharp(req.file.buffer).resize({ width: 250 }).png().toBuffer()     //semua file di resize dan diubah menjadi .png, lalu ke buffer

    // ubah avatar
    user.avatar = buffer
    // user.name = data_name
    // user.email = data_email
    // user.password = data_password
    // user.age = data_age

    // simpan perubahan data
    user.save()

    res.send('Update Profile success !')

})


// DELETE USER BY ID : findByIdAndDelete
// Kasih pesan jika user tidak di temukan
app.delete('/users/:id', (req,res) => {
    const data_id = req.params.id;

    User.findByIdAndDelete(data_id)
    .then( user => {
        res.send({
            message: user.name + ' has been deleted successfully !'
        });
    })
    .catch( err => {
        res.send(err);
    })
})




///////////////////////////////////////////////////////////////////////////////////////
                                    /* TASK */
////////////////////////////////////////// POST

// CREATE ONE TASK WITH USER ID (EDITED)
app.post('/tasks/:userid', async (req,res) => {
    const data_desc = req.body.description
    const data_id = req.params.userid

    // Cari user berdasarkan ID
    var findUser = await User.findById(data_id)

    // Jika user tidak ditemukan
    if (!findUser) {
        res.send('Unable to create task (cannot find User)')
    }

    // Create task with Task Model  { _id (generated from mongoDB), description, completed, owner }
    var task = new Task({
        description: data_desc,
        owner: data_id
        // _id : blablabla
        // completed = gak di create -> otomatis false
    })

    console.log(findUser);

    // Masukkan id dari task yang sudah dibuat ke array 'tasks'
    findUser.tasks = findUser.tasks.concat(task._id)

    await findUser.save()
    await task.save()

    // res.send({
    //     message: 'Update berhasil !!!',
    //     task,
    //     findUser,
    // })

    res.send(task)

})

/////////////////////////////////// GET
// GET TASK BY USERID
app.get('/tasks/:userid', async (req,res) => {

    // findById() method
    var findUser = await User.findById(req.params.userid).populate( { path: 'tasks', options: {sort: {completed: 1}} } ).exec()

    if(!findUser) {
        return res.send('Unfortunately, unable to read tasks :(')
    }

    res.send(findUser)

    /*  // .find() method
        var findUser = await User.find({ _id: req.params.userid }).populate({path: 'tasks'}).exec()
        // populate path mencari property 'tasks' -> mencari semua property pada ObjectId
        // find -> return array Object
        // findById -> return only Object

        if(!findUser[0]) {
            res.send('Unable to read tasks :(')
        }

        res.send(findUser[0].tasks)
    */

} )


///////////////////////////////// UPDATE
// UPDATE TASK BY USERID AND TASKID (COMPLETED = TRUE)
app.patch('/tasks/:userid/:taskid', async (req,res) => {
    const data_userid = req.params.userid
    const data_taskid = req.params.taskid

    var findUser = await User.findById(data_userid)

    if(!findUser) {
        return res.send('User tidak ditemukan')
    }

    // Menemukan task by id
    var findTask = await Task.findOne( { _id : data_taskid } )

    if(!findTask) {
        return res.send('Task tidak ditemukan')
    }

    findTask.completed = !findTask.completed        //true to false || false to true

    await findTask.save()   
    res.send(findTask)
})


// UPDATE TASK COMPLETED = FALSE
app.patch('/tasks/false/:userid/:taskid', async (req,res) => {
    const data_userid = req.params.userid
    const data_taskid = req.params.taskid

    let findUser = await User.findById(data_userid)

    if(!findUser) {
        return res.send('User tidak ditemukan')
    }

    // Menemukan task by id
    let findTask = await Task.findOne( { _id : data_taskid } )

    if(!findTask) {
        return res.send('Task tidak ditemukan')
    }

    findTask.completed = false

    await findTask.save()

    res.send(findTask)
})


////////////////////////// DELETE
// DELETE ONE TASK BY TASKID
app.delete('/task', async (req,res) => {
    const data_taskid = req.body.taskid;

    var deleteTask = await Task.findByIdAndDelete(data_taskid)

    res.send(deleteTask)

})

// DELETE USERID AND TASKID
app.delete('/users/:userid/:taskid', async (req,res) => {
    const data_userid = req.params.userid
    const data_taskid = req.params.taskid

    var findUser = await User.findById(data_userid)

    if(!findUser) {
        return res.send('User tidak ditemukan')
    }

    var findTask = await Task.findByIdAndDelete(data_taskid)

    if(!findTask) {
        return res.send('Task tidak ditemukan')
    }

    await findTask.save()
    res.send(findTask)
    // res.send( ` '${findTask.description}' Task berhasil di delete`)
})





app.listen(port, () => {
    console.log('Berjalan di port ' + port );
})