let person = {
    name: '',
    age: 27,
    email: 'rein@gmail.com',
    password: ''
}

let toArray = Object.keys(person)    //  [ 'name', 'age', 'email', 'password' ] property nya doang
console.log(toArray)


toArray.forEach( key => { 
    // string kosong, undefined, null --> false
    if(!person[key]) {
        delete person[key]
    }
})

console.log(person)
