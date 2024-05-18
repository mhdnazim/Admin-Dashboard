import { Router } from "express"
import { addEmployee, deleteEmployee, editEmployee, employeeList, login, viewEmployee } from "../controller/employeeController.js"
import multerConfig from "../middlewares/multer/uploadImage.js"
import { check } from "express-validator"
import authCheck from "../middlewares/authCheck.js"

const router = Router()

router.post('/login', login)

router.use(authCheck)

router.post('/add', multerConfig.single("image"),
    [
        check('first_name').not().isEmpty(),
        check('last_name').not().isEmpty(),
        check('email').not().isEmpty(),
        check('gender').not().isEmpty(),
        check('mobile').isAlphanumeric(),
        check('designation').not().isEmpty(),
        check('courses').not().isEmpty()
    ], addEmployee
)
router.post('/list', employeeList)
router.post('/view', viewEmployee)

router.patch('/edit', multerConfig.single("image"), editEmployee)
router.patch('/delete', deleteEmployee)


export default router;