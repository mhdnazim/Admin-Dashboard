import mongoose from "mongoose"

const employeeSchema = new mongoose.Schema({
    first_name : {
        type : String,
        required : true
    },
    last_name : {
        type : String,
        required : true
    },
    image : {
        type : String,
        default : null
    },
    email : {
        type : String,
        required : true
    }, 
    mobile : {
        type : Number,
        required : true 
    },
    designation : {
        type : String,
        required : true
    },
    gender : {
        type : String,
        required : true
    },
    courses : {
        type : String,
        required : true 
    },
    status : {
        type : String,
        default: "Active"
    },
    password : {
        type : String
    },
    isDeleted : {
        type : Boolean,
        default : false
    }
},
{ timestamps: true })

const employees = new mongoose.model('employees', employeeSchema)

export default employees;