import {Router} from "express"
import { registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router= Router()

router.route("/register").post(
    upload.fields([
    {
         name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
    ]),
    registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").post(verifyJWT, getCurrentUser)

router.route("/update-account").post(verifyJWT, updateAccountDetails)

router.route("/update-avatar").post(
    verifyJWT,
    upload.single('avatar'),  //We have to give same name as in schema
   updateUserAvatar)

router.route("/update-coverImage").post(
    verifyJWT,
    upload.single('coverImage'),
     updateUserCoverImage)


export default router;