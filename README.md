# MERN_Store 
Run on  
[gunstashop.herokuapp.com](https://gunstashop.herokuapp.com/)  
Store on MongoDB Express React and Node 
### What is implemented:
>**1. login and registration**  
>**2. file/product upload**  
>**3. paypal**  
>**4. goods filtering**  
>**5. cart contol**  
>**6. commenting on goods**
 
### What need for running on heroku:
>**1. Create heroku app**  
>**2. create var in heroku setting mongoURI with your MongoDB link on Cluster**  
>**3. upload**  

### What need for running locally:
>**1. git clone**  
>**2. npm install in / && npm install in client**  
>**3. in server config dir create dev.js and write**  
module.exports = {
  mongoURI:"mongoDBconnectLink"
}  
>**4. npm start in / && in /client/**  
 
### Technologies used:
    Client:
    "antd": "^3.24.1",
    "axios": "^0.18.0",
    "formik": "^1.5.8",
    "moment": "^2.24.0",
    "react": "^16.8.6",
    "react-dom": "^16.8.6",
    "react-dropzone": "^10.2.1",
    "react-icons": "^3.7.0",
    "react-image-gallery": "^1.0.3",
    "react-input-range": "^1.3.0",
    "react-paypal-express-checkout": "^1.0.5",
    "react-redux": "^7.1.0-rc.1",
    "react-router-dom": "^5.0.1",
    "react-scripts": "3.0.1",
    "redux": "^4.0.0",
    "redux-form": "^8.2.6",
    "redux-promise": "^0.6.0",
    "redux-thunk": "^2.3.0",
    "socket.io-client": "^2.2.0",
    "yup": "^0.27.0"
    Server:
    "async": "^3.1.0",
    "bcrypt": "^3.0.6",
    "body-parser": "^1.18.3",
    "cookie-parser": "^1.4.3",
    "cors": "^2.8.5",
    "express": "^4.17.1",
    "jsonwebtoken": "^8.5.1",
    "moment": "^2.24.0",
    "mongoose": "^5.4.20",
    "multer": "^1.4.2",
    "react-redux": "^5.0.7",
    "socket.io": "^2.2.0"



