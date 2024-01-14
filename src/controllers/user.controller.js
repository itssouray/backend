import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const data = {
    name:"sourav",
    email:"itssouravgupta@gmail.com",
    password:"15378t2ghasv78t2"
}

const registerUser = asyncHandler(async (req,res)=>{

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them on cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response 
    // check for user creation 
    // return res

    const {fullName,email,username,password} = req.body
    console.log("email : ",email);

    if([fullName,email,username,password].some((field)=>field?.trim()=="")){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = User.findOne({
        $or : [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(400,"User with email or username already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverimageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverimageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar file is required");
    }

    User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createUser = await User.findByid(user._id).select(
        "-password -refreshToken"
    )

    if(!createUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createUser,"User registered Successfully")
    )
});

export {registerUser};