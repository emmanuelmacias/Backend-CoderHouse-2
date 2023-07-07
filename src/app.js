import express from "express";
import { __dirname } from "./path.js";
import { Server } from "socket.io";
import { errorHandler } from "./middlewares/errorHandler.js";
import handlebars from "express-handlebars";
import productsRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import socketRouter from "./routes/socket.routes.js";
import usersRouter from "./routes/users.routes.js";
import viewsRouter from "./routes/views.routes.js";
import messagesRouter from "./routes/messages.routes.js";
import MessagesDaoMongo from "./daos/mongodb/messages.dao.js";
import ProductsDaoMongoDB from "./daos/mongodb/products.dao.js";
import mongoStore from 'connect-mongo'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import "./db/database.js";
import passport from "passport";
import "./passport/strategies.js";
import "./passport/github-passport.js";
//import { ProductManager } from "./daos/filesystem/products.dao.js";

const messagesManager = new MessagesDaoMongo();
const productManager = new ProductsDaoMongoDB(); 
/* const productManager = new ProductManager("/products.json"); */

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler); // Manejo de errores
app.use(cookieParser());

app.use(express.static(__dirname + "/public"));

//Configuration HandleBars
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

//Session Configuration
app.use(
  session({
    secret: 'sessionKey',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 10000
    },
    store: new mongoStore({
      mongoUrl: 'mongodb+srv://admin-user:yHpQ59f6Nm39JZlN@cluster0.72t9vwl.mongodb.net/coderhouse',
      //autoRemove: "interval",
      ttl: 10,
      //crypto: {
      //    secret: '123456',       //encripta los datos de la sesion
       //},
    }),
  })
)

//Routes
app.use("/products", productsRouter);
app.use("/carts", cartRouter);
app.use("/messages", messagesRouter);
app.use("/users", usersRouter);
app.use("/views", viewsRouter);
app.use("/", socketRouter);

//Http Server
const httpServer = app.listen(PORT, () => {
  console.log(`Server run OK in port: ${PORT}`);
});

//WebSocket Server Connection
const socketServer = new Server(httpServer);
const allProducts = await productManager.getAllProducts();

socketServer.on("connection", (socket) => {
  console.log("🟢User connection established!", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴User disconnected!", socket.id);
  });

  socketServer.emit("arrayProducts", allProducts); // Muestra en tiempo real el array de productos

  socket.on("newProduct", async (product) => {
    try {
      await productManager.addProduct(product);
      const arrayProducts = await productManager.getAllProducts();
      socketServer.emit("arrayProducts", arrayProducts); //!ENVÍO A TODOS
      // socket.emit('arrayProducts', arrayProducts)       //!ENVÍO AL SOCKET EN PARTICULAR
      // socket.broadcast.emit('arrayProducts', arrayProducts)    //!ENVÍO A TODOS MENOS AL QUE ENVÍA
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("deleteProduct", async (productId) => {
    try {
      await productManager.deleteProduct(productId);
      const arrayProducts = await productManager.getAllProducts();
      socket.emit("arrayProducts", arrayProducts);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("newUser", (username) => {
    console.log(`${username} is logged in`);
  });

  socket.on("chat:message", async ({ username, message }) => {
    await messagesManager.createMessage(username, message);
    socketServer.emit("messages", await messagesManager.getAllMessages());
  });

  socket.on("newUser", (username) => {
    socket.broadcast.emit("newUser", username);
  });

  socket.on("chat:typing", (data) => {
    socket.broadcast.emit("chat:typing", data);
  });

});
