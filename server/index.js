const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const moment = require('moment');
const async = require('async');
const multer = require('multer');
const productRouter = express.Router();
const userRouter = express.Router();
const Schema = mongoose.Schema;
 
const config = require("./config/key");

const userSchema = mongoose.Schema({
  name: {
      type: String,
      maxlength: 50
  },
  email: {
      type: String,
      trim: true,
      unique: 1
  },
  image: {
    type: String,
    minglength: 5
  },
  password: {
      type: String,
      minglength: 5
  },
  role: {
      type: Number,
      default: 0
  },
  cart: {
      type: Array,
      default: []
  },
  history: {
      type: Array,
      default: []
  },
  image: String,
  token: {
      type: String,
  },
  tokenExp: {
      type: Number
  }
})

userSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
      bcrypt.genSalt(saltRounds, function (err, salt) {
          if (err) return next(err);

          bcrypt.hash(user.password, salt, function (err, hash) {
              if (err) return next(err);
              user.password = hash
              next()
          })
      })
  } else {
      next()
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch)
  })
}

userSchema.methods.generateToken = function (cb) {
  var user = this;
  var token = jwt.sign(user._id.toHexString(), 'secret')
  var oneHour = moment().add(1, 'hour').valueOf();

  user.tokenExp = oneHour;
  user.token = token;
  user.save(function (err, user) {
      if (err) return cb(err)
      cb(null, user);
  })
}

userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  jwt.verify(token, 'secret', function (err, decode) {
      user.findOne({ "_id": decode, "token": token }, function (err, user) {
          if (err) return cb(err);
          cb(null, user);
      })
  })
}

const User = mongoose.model('User', userSchema);


let auth = (req, res, next) => {
  let token = req.cookies.w_auth;

  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.json({
        isAuth: false,
        error: true
      });

    req.token = token;
    req.user = user;
    next();
  });
};



const paymentSchema = mongoose.Schema({
  user: {
      type: Array,
      default: []
  },
  data: {
      type: Array,
      default: []
  },
  product: {
      type: Array,
      default: []
  }


}, { timestamps: true })




const Payment = mongoose.model('Payment', paymentSchema);



const productSchema = mongoose.Schema({
  writer: {
      type: Schema.Types.ObjectId,
      ref: 'User'
  },
  title: {
      type: String
  },
  description: {
      type: String
  },
  price: {
      type: Number,
      default: 0
  },
  images: {
      type: Array,
      default: []
  },
  weapon: {
      type: Number,
      default: 1
  },
  coments: {
      type: Array,
      default: []
  }
}, { timestamps: true })


productSchema.index({ 
  title:'text',
}, {
  weights: {
      name: 5,
      description: 1,
  }
})

const Product = mongoose.model('Product', productSchema);

    
 
const connect = mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));


app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());


var storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`)
  },
  fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      if (ext !== '.jpg' || ext !== '.png') {
          return cb(res.status(400).end('only jpg, png are allowed'), false);
      }
      cb(null, true)
  }
})

var upload = multer({ storage: storage }).single("file")


productRouter.post("/uploadImage", auth, (req, res) => {

  upload(req, res, err => {
      if (err) {
          return res.json({ success: false, err })
      }
      return res.json({ success: true, image: res.req.file.path, fileName: res.req.file.filename })
  })

});


productRouter.post("/uploadWeapon",  (req, res) => {
  const product = new Product(req.body)

  product.save((err) => {
      if (err) return res.status(400).json({ success: false, err })
      return res.status(200).json({ success: true })
  })

});


productRouter.post("/uploadWeapon/:id", async (req, res) => {

    const projectId = req.body._id;
    const project = await Product.findById(projectId);
    if (project) {
      project._id = req.body._id;
      project.title = req.body.title;
      project.writer = req.body.writer;
      project.price = req.body.price;
      project.images = req.body.images;
      project.weapon = req.body.weapon;
      project.description = req.body.description;
      project.coments = req.body.coments;
      const updatedProject = await project.save();
      if (updatedProject) {
        return res.status(200).send({ message: 'Project Updated', data: updatedProject });
      }
    }
    return res.status(500).send({ message: ' Error in Updating Project.' });
  
  });



productRouter.post("/getProducts", (req, res) => {
    let sortBy = "_id";
    let order =  "desc";
    if(req.body.SortBy == 'From cheap to expensive') {
        sortBy = 'price'
        order = "asc"
    } else if(req.body.SortBy == "From expensive to cheap"){
        sortBy = 'price'
        order = "desc"
    } 
    // let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);

    let findArgs = {};
    let term = req.body.searchTerm;
    let low = req.body.min_price || 0;
    let max = req.body.max_price || Infinity;
    let find_weapon = []
    let weapons_was = 0;
    if(req.body.weapon)
    for(var x = 0; x < req.body.weapon.length; x++){
        if(req.body.weapon[x]){
            find_weapon.push(x)
            weapons_was = 1;
        }
    }
    let weapon = [];
    if(weapons_was) {
        weapon = find_weapon
        findArgs = {
            price: {
                $gte: low,
                $lte: max
            },
            weapon: weapon
        }
    }
    if(!weapons_was) {
        weapon = find_weapon
        findArgs = {
            price: {
                $gte: low,
                $lte: max
            }
        }
    }


    let maxPrice;
    var vsegoTovara;
    const send_on_client = async () => {
        if(term)
            maxPrice = await Product.find(findArgs).find({ "title": { "$regex": term, "$options": "i" }}).sort({ price: -1 }).limit(1);
        else
            maxPrice = await Product.find(findArgs).sort({ price: -1 }).limit(1);
        if(term)
        vsegoTovara = (await Product.find(findArgs).find({ "title": { "$regex": term, "$options": "i" }})).length;
        else
        vsegoTovara =  (await Product.find(findArgs)).length;

        if (term) {
            Product.find(findArgs)
                .find({ "title": { "$regex": term, "$options": "i" }})
                .populate("writer")
                .sort([[sortBy, order]])
                .skip(skip)
                .limit(limit)
                .exec((err, products) => {
                    if (err){ return res.status(400).json({ success: false, err })}
                    res.status(200).json({ success: true, products, postSize: vsegoTovara, maxPrice:maxPrice})
                })
        } else {
            
            Product.find(findArgs)
                .populate("writer")
                .sort([[sortBy, order]])
                .skip(skip)
                .limit(limit)
                .exec((err, products) => {
                    if (err) return res.status(400).json({ success: false, err })
                    res.status(200).json({ success: true, products, postSize: vsegoTovara, maxPrice:maxPrice })
                })
        }

    }
    send_on_client()

    

      
});


//?id=${productId}&type=single
//id=12121212,121212,1212121   type=array 
productRouter.get("/products_by_id", (req, res) => {
  let type = req.query.type
  let productIds = req.query.id


  if (type === "array") {
      let ids = req.query.id.split(',');
      productIds = [];
      productIds = ids.map(item => {
          return item
      })
  }




  //we need to find the product information that belong to product Id 
  Product.find({ '_id': { $in: productIds } })
      .populate('writer')
      .exec((err, product) => {
          if (err) return res.status(400).send(err)
          return res.status(200).send(product)
      })
});

productRouter.get("/getUserProducts", (req, res) => {
    let userId = req.query.userId
    let term = req.query.term
    
    console.log(userId,'\n\n\n',111)
    if(term)
    Product.find({writer: userId}).find({ "title": { "$regex": term, "$options": "i" }}).exec((err, products) => {
        if(err) return res.status(400).send(err)
        res.status(200).send(products)
    })
    else{
        Product.find({writer: userId}).exec((err, products) => {
            if(err) return res.status(400).send(err)
            res.status(200).send(products)
        })
    }
 
  });  


  productRouter.get("/rmrfProduct", (req, res) => {
    let userId = req.query.userId
    let productId = req.query.productId
  
    Product.find({ _id:productId }).remove().exec();
    Product.find({writer: userId}).exec((err, products) => {
        if(err) return res.status(400).send(err)
        res.status(200).send(products)
    })
 
  });  



userRouter.get("/auth", auth, (req, res) => {
  res.status(200).json({
      _id: req.user._id,
      isAdmin: req.user.role === 0 ? false : true,
      isAuth: true,
      email: req.user.email,
      name: req.user.name,
      lastname: req.user.lastname,
      role: req.user.role,
      image: req.user.image,
      cart: req.user.cart,
      history: req.user.history
  });
});

userRouter.post("/register", (req, res) => {

  const user = new User(req.body);

  user.save((err, doc) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).json({
          success: true
      });
  });
});

userRouter.post("/changePassword", (req, res) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(req.body.password, salt, function (err, new_pass) {
        User.findOneAndUpdate({ _id: req.body.id }, { password: new_pass }, (err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        });
    });
    })
})
  });
  

userRouter.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
      if (!user)
          return res.json({
              loginSuccess: false,
              message: "Auth failed, email not found"
          });

      user.comparePassword(req.body.password, (err, isMatch) => {
          if (!isMatch)
              return res.json({ loginSuccess: false, message: "Wrong password" });

          user.generateToken((err, user) => {
              if (err) return res.status(400).send(err);
              res.cookie("w_authExp", user.tokenExp);
              res
                  .cookie("w_auth", user.token)
                  .status(200)
                  .json({
                      loginSuccess: true, userId: user._id
                  });
          });
      });
  });
});

userRouter.get("/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "", tokenExp: "" }, (err, doc) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
          success: true
      });
  });
});


userRouter.get('/addToCart', auth, async (req, res) => {

  const productBody = await Product.findById(req.query.productId);
  User.findOne({ _id: req.user._id }, (err, userInfo) => {
      let duplicate = false;

      userInfo.cart.forEach((item) => {
          if (item.id == req.query.productId) {
              duplicate = true;
          }
      })

      if (duplicate) {
          User.findOneAndUpdate(
              { _id: req.user._id, "cart.id": req.query.productId },
              { $inc: { "cart.$.quantity": 1 } },
              { new: true },
              (err, userInfo) => {
                  if (err) return res.json({ success: false, err });
                  res.status(200).json(userInfo.cart)
              }
          )
      } else {
          User.findOneAndUpdate(
              { _id: req.user._id },
              {
                  $push: {
                      cart: {
                          id: req.query.productId,
                          quantity: 1,
                          date: Date.now(),
                          productBody: productBody
                      }
                  }
              },
              { new: true },
              (err, userInfo) => {
                  if (err) return res.json({ success: false, err });
                  res.status(200).json(userInfo.cart)
              }
          )
      }
  })
});


userRouter.get('/decriseFromCart', auth, async (req, res) => {

    console.log(req.query.productId)

    User.findOne({ _id: req.user._id }, (err, userInfo) => {
        let colichestvo_v_cart = 0;
        userInfo.cart.forEach((item) => {
            if (item.id == req.query.productId) {
                colichestvo_v_cart = item.quantity;
            }
        })
        if(colichestvo_v_cart == 1 || colichestvo_v_cart == 0) {
            User.findOneAndUpdate( { _id: req.user._id },
                {
                    $pull: {
                        cart: {
                            id: req.query.productId,
                        }
                    }
                },
                { new: true },
                (err, userInfo) => {
                    if (err) return res.json({ success: false, err });
                    res.status(200).json(userInfo.cart)
                    console.log(userInfo.cart)
                })
        }else{
            User.findOneAndUpdate(
                { _id: req.user._id, "cart.id": req.query.productId },
                { $inc: { "cart.$.quantity": -1 } },
                { new: true },
                (err, userInfo) => {
                    if (err) return res.json({ success: false, err });
                    res.status(200).json(userInfo.cart)
                }
            )
        }
    })
  });
userRouter.get('/rmrfFromCart', auth, (req, res) => {
  User.findOneAndUpdate(
      { _id: req.user._id },
      {
          "$pull":
              { "cart": { "id": req.query._id } }
      },
      { new: true },
      (err, userInfo) => {
          let cart = userInfo.cart;


console.log(cart)
                  return res.status(200).json({
                      cart
                  })

      }
  )
})


userRouter.get('/rmrfAllFromCart', auth, (req, res) => {
    User.findOneAndUpdate(
        { _id: req.user._id },
        {
            $set: { cart: [] }
        },
        { new: true },
        (err, userInfo) => {
            let cart = userInfo.cart;
  
  
  console.log(cart)
                    return res.status(200).json({
                        cart
                    })
  
        }
    )
  })
userRouter.get('/userCartInfo', auth, (req, res) => {
  User.findOne(
      { _id: req.user._id },
      (err, userInfo) => {
          let cart = userInfo.cart;
          let array = cart.map(item => {
              return item.id
          })


          Product.find({ '_id': { $in: array } })
              .populate('writer')
              .exec((err, cartDetail) => {
                  if (err) return res.status(400).send(err);
                  return res.status(200).json({ success: true, cartDetail, cart })
              })

      }
  )
})
userRouter.post('/successBuy', auth, async (req, res) => {
  let history = [];
  let transactionData = {};
  let usersInfo = [];
  User.find().exec((errro, users_global) => {
    users_global.forEach((asd) => {
        usersInfo.push({
            id:asd._id,
            name: asd.name,
            email: asd.email,
        })
    })
    req.body.cartDetail.forEach((item) => {
        let indexOfusersInfo;
        for (let gg = 0; gg < usersInfo.length; gg++) {
            if(usersInfo[gg].id == item.productBody.writer)
                indexOfusersInfo = gg;
        }
        history.push({
            dateOfPurchase: Date.now(),
            name: item.productBody.title,
            id: item.productBody._id,
            price: item.productBody.price,
            writer: usersInfo[indexOfusersInfo],
            quantity: item.quantity,
            paymentId: req.body.paymentData.paymentID
        })
    })
  
    transactionData.user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
    }
  
    transactionData.data = req.body.paymentData;
    transactionData.product = history
  
    User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { history: history }, $set: { cart: [] } },
        { new: true },
        (err, user) => {
            if (err) return res.json({ success: false, err });
  
  
            const payment = new Payment(transactionData)
            payment.save((err, doc) => {
                if (err) return res.json({ success: false, err });

                let products = [];
                doc.product.forEach(item => {
                    products.push({ id: item.id, quantity: item.quantity })
                })

                async.eachSeries(products, (item, callback) => {
                    Product.update(
                        { _id: item.id },
                        { new: false },
                        callback
                    )
                }, (err) => {
                    if (err) return res.json({ success: false, err })
                    res.status(200).json({
                        success: true,
                        cart: user.cart,
                        history: user.history,
                        cartDetail: []
                    })
                })
  
            })
        }
    )
})
})
app.use('/api/users', userRouter);
app.use('/api/product', productRouter);

app.use('/uploads', express.static('uploads'));

if (process.env.NODE_ENV === "production") {

  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Server Running at ${port}`)
});
