import { Router } from "express";
import ProductsDaoMongoDB from "../daos/mongodb/products.dao.js"
//import { ProductManager } from "../daos/filesystem/products.dao.js";

const router = Router();
const productManager = new ProductsDaoMongoDB(); 
//const productManager = new ProductManager("/products.json")

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getAllProducts(); 
        const productsDocs = products.docs;
        res.render('home', { productsDocs });
        console.log(productsDocs);
    } catch (error) {
        console.log(error);
    }
});

//Ruta con WebSocket
router.get("/realtimeproducts", (req, res) => {
    res.render("realTimeProducts");
  });

export default router;