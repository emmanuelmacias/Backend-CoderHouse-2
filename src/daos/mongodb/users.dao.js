import { createHash, isValidPassword } from '../../path.js';
import { userModel } from './models/users.model.js'

export default class UserDao {
  async createUser(user) {
    try {
      const { first_name, last_name, email, age, password } = user;
      const existUser = await userModel.find({email});
      if(existUser.length === 0){
        if(email === 'adminCoder@coder.com' && password === 'adminCoder123'){
          return await userModel.create({...user, password: createHash(password), role: 'admin'});
        } else {
          const newUser = await userModel.create({...user, password: createHash(password)});
          return newUser
        }
      } else {
        return null;
      }
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  }

  async loginUser(user){
    try {
      const { email, password } = user;
      const userExist = await userModel.findOne({ email });
      if(userExist){
        const passValid = isValidPassword(password, userExist);
        console.log(passValid);
        if(!passValid) {
          return false
        } else {
          return userExist;
        }
      } return false
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  }

  async getById(id) {
    try {
      const userExist = await userModel.findById(id)
      if (userExist) {
        return userExist
      } return false
    } catch (error) {
      console.log(error)
    }
  }

  async getByEmail(email) {
    try {
      const userExist = await userModel.findOne({ email });
      if (userExist) {
        return userExist
      } return false
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  }
}