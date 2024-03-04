import mongoose from "mongoose";

interface IUser {
  email: string;
  password: string;
}

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],
      },
    
      password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
      },
})

const User = mongoose.model("User", UserSchema);

export {User}



