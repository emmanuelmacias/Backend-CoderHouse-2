import {Router} from 'express';
import { getAllService } from '../services/products.services.js';

const router = Router()

router.get('/',(req,res)=>{
    res.render('login')
})

router.get('/register',(req,res)=>{
    res.render('register')
})

router.get('/error-register',(req,res)=>{
    res.render('errorRegister')
})

router.get('/error-login',(req,res)=>{
    res.render('errorLogin')
})

router.get('/profile', async (req, res) => {
    const products = await getAllService();
    const allProducts = products.docs;
    const user = req.session.user;
    console.log(products.docs); 
    console.log(user);
    res.render('profile', { user, allProducts});
  })
    
export default router