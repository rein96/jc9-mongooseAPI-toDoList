const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,  //kalo kosong = error
        trim: true       //remove whitespaces (spaces) diawal dan diakhir
    },
    email: {
        type: String,
        required: true,
        index: {        //index nya unique  -> input email harus unique
            unique: true
        },
        trim : true,
        lowercase:true,
        validate(value) {   // value -> data yang diinput oleh user
            var hasil = validator.isEmail(value);   // boolean true or false
             
            // kalo bukan email
            if(!hasil) {    // hasil === false  
                throw new Error('Please input the correct email format !')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            var includePassword = validator.contains(value.toLowerCase(), 'password')

            // // Alternative way
            // if(value.toLowerCase().includes('password')) {
            //     throw new Error('Password tidak boleh mengandung kata "password" ')
            // }

            if(includePassword === true) {
                throw new Error('Password cannot contain "password" !')
            }
        }
    },
    age : {
        type: Number,
        min: 0,
        default: 0,
        validate(value) {
            if(value === null) {
                throw new Error('Age tidak boleh berupa string kosong ')
            } else if ( value < 0) {
                throw new Error('Age tidak boleh berupa angka negatif ')       
            }
        }
    },
    avatar: {
        type : Buffer
    },
    tasks: [    // Array {Object}
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        } 
    ]
})

// Model method
// loginWithEmail = nama function nya
userSchema.statics.loginWithEmail = async (inputEmail, inputPassword) => {
    
    try {
        const findUserByEmail = await User.findOne( { email: inputEmail } )
        console.log(findUserByEmail)

        if(!findUserByEmail) {
            throw new Error('findUserByEmail === false')
        }
    
        //isMatch -> true || false
        const isMatch = await bcrypt.compare(inputPassword, findUserByEmail.password) 
        console.log(isMatch);
    
        if(!isMatch) {
            throw new Error('isMatch bcrypt === false')
        }
    
        // isMatch === true
        return findUserByEmail;
        
    } catch (err) {
        console.error(err);
    }

}




// Membuat function yang akan dijalankan sebelum proses user.save()
userSchema.pre('save', async function(next) {
    // this = berisi object User yang kita mau hash password nya
    /* 
        const person = new User({   // const User = mongoose.model('User', userSchema)
        name: data_name,
        email: data_email,
        password: data_password,
        age: data_age
    })
    */
    const user = this
    console.log('USER ATAU PENGGUNA:')
    console.log(user)

    if(user.isModified('password')) {   
        // user = object, apakah property 'password' berubah ? kalo true di HASH !
        // akan TRUE saat pertama dibuat dan mengalami perubahan
        // user.password = await bcrypt.hash(user.password, 8);
        // user.password = hasil   // !!!!!!!!!!!!!

        var hasil = await bcrypt.hash(user.password, 8)
        user.password = hasil // karakter hasil hash
    } 

    next();

})

// 'User' = model
const User = mongoose.model('User', userSchema)

module.exports = User