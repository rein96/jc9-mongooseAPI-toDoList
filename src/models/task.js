const mongoose = require('mongoose');

// taskSchema with 2 parameter
const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false  //belum dikerjakan
    },
    owner: {    //specific Task = specific user (ObjectId)
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',    //menunjuk id di field User

    }
    
}, {    // 2nd parameter
    // kapan dibuat dan kapan mengalami perubahan dicatat = timestamps
    timestamps: true    //Membuat field = createdAt, updatedAt
})

const Task = mongoose.model('Task', taskSchema);
// nama database 'Task' -> di database jadinya -> 'tasks'

module.exports = Task;