import employees from "../models/employee.js"
import { validationResult } from "express-validator"
import HttpError from "../middlewares/httpError.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import * as fs from 'fs'

export const login = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return next(new HttpError("Invalid data inputs passed, please check your data before retry!", 422))
        } else {
            const { email, password } = req.body
            
            const user = await employees.findOne({ email })

            if (!user) {
                return next(new HttpError("Invalid credentials", 400))
            } else {
                // const isValidPassword = await bcrypt.compare(password, user.password)

                if (password !== user.password ){
                    return next(new HttpError("Invalid credential", 400))
                } 
                else if (password === user.password ) {

                    const token = jwt.sign({ userId: user._id, userEmail: user.email, role: user.designation }, process.env.JWT_SECRET,
                        { expiresIn: process.env.JWT_TOKEN_EXPIRY }
                    )
                    res.status(200).json({
                        status: true,
                        message: 'Login successful',
                        data: {
                            _id: user._id,
                            role: user.designation
                        },
                        access_token: token
                    })
                }
            }
        }
    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

export const employeeList = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return next(new HttpError("Something went wrong...", 422))
        } else {
            const { search } = req.body
            const { from, to } = req.body
            const query = { isDeleted: false }

            if (search) {
                const searchQuery = search.toLowerCase()
                query.$or = [
                    { first_name: { $regex: searchQuery, $options: 'i' } },
                    { last_name: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } },
                    { designation: { $regex: searchQuery, $options: 'i' } }
                ];
            }

            if ( from && to){
                query.createdAt = { $gte: from, $lte: to }
            }

            const employeeData = await employees.find(query)

            res.status(200).json({
                status: true,
                message: '',
                data: employeeData,
                access_token: null
            })
        }

    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}


export const viewEmployee = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return next(new HttpError("Something went wrong...", 422))
        } else {
            const { _id } = req.body
            const query = { isDeleted: false }

            if (_id) {
                query._id = _id
            }

            const employeeData = await employees.findOne(query)
            // const bookData = await books.find(query)

            res.status(200).json({
                status: true,
                message: '',
                data: employeeData,
                access_token: null
            })
        }

    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}



export const addEmployee= async (req, res, next) => {
    try {

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            console.log("error")
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {
            // const { role } = req.userData

            // if (role === "admin") {
            const { first_name, last_name, email, mobile, designation, gender, courses } = req.body

            const course = JSON.parse(courses).toString()

            const image = req.file ? process.env.BASE_URL + "/employees/profile/" + req.file.filename : null

            const existingUser = await employees.findOne({ email })

            if ( ! existingUser ) {
                const newEmployee = new employees({
                    first_name, last_name, email, mobile, designation, gender, courses: course, image
                })
                await newEmployee.save()
                res.status(200).json({
                    status: true,
                    message: 'New Employee successfully added...!',
                    data: null
                })
            }else {
                res.status(501).json({
                    status: true,
                    message: 'Permission denied...',
                    data: null
                })
            }
        }
    }
    catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}


export const editEmployee = async (req, res, next) => {
    try {

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            console.log("error")
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {
            const { _id, first_name, last_name, email, mobile, designation, gender, courses, status } = req.body

            const course = JSON.parse(courses).toString()

            const employeeData = await employees.findOne({ _id })

            const image = req.file ? process.env.BASE_URL + "/employees/profile/" + req.file.filename : employeeData.image

            var existingEmail = null

            if ( email !== employeeData.email ){
                existingEmail = await employees.findOne({ email })
            }
            // console.log(existingEmail, "email")
            if ( ! existingEmail ) {
                    if (req.file && employeeData.image !== null) {
                        const prevImgPath = employeeData.image.slice(22)
                        fs.unlink(`./uploads/${prevImgPath}`, (err) => {
                            if (err) {
                                console.error(err)
                                return
                            }
                        })
                    }
            
                    const updateEmployee = await employees.findOneAndUpdate({ _id }, {
                        _id, first_name, last_name, email, mobile, designation, gender, courses: course, status, image
                    }, { new: true })
                    res.status(200).json({
                        status: true,
                        message: '',
                        data: updateEmployee
                    })
            } 
            else {
                res.status(501).json({
                    status: true,
                    message: 'Permission denied...',
                    data: null,
                    access_token: null
                })
            }



        }

    }
    catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

export const deleteEmployee = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            console.log("error")
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {
            // const { role } = req.userData

            // if (role === "admin") {
                const { _id } = req.body

                const deletedBook = await employees.findOneAndUpdate({ _id }, {
                    isDeleted: true
                }, { new: true })
                res.status(200).json({
                    status: true,
                    message: '',
                    data: deletedBook,
                    access_token: null
                })
            // } else {
            //     res.status(200).json({
            //         status: true,
            //         message: 'Permission denied...',
            //         data: null,
            //         access_token: null
            //     })
            // }
        }
    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}