import React, { Suspense,useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import { Provider, useSelector, useDispatch } from 'react-redux';
import { createStore, applyMiddleware, combineReducers  } from 'redux';
import promiseMiddleware from 'redux-promise';
import ReduxThunk from 'redux-thunk';
import { Icon } from 'antd';
import axios from 'axios';
import Axios from 'axios';
import { Carousel } from 'antd';
import InputRange from 'react-input-range';
import moment from "moment";
import { Formik } from 'formik';
import * as Yup from 'yup';
import Dropzone from 'react-dropzone';
import PaypalExpressBtn from 'react-paypal-express-checkout';

import {
  Form,
  Input,
  Button,
} from 'antd';
// import { set } from 'mongoose';
// import { settings } from 'cluster';
const config = {
  MAGIC_HOST: ""
};
const { TextArea } = Input;

if (process.env.NODE_ENV === 'production') {
  config.MAGIC_HOST=process.env.MY_HOST;
} else {
  config.MAGIC_HOST='http://localhost:5000';
}

let allow_in1sec = 1;
setInterval(() => {
    allow_in1sec = 1;
}, 30);

const LOGIN_USER = 'login_user';
const REGISTER_USER = 'register_user';
const AUTH_USER = 'auth_user';
const LOGOUT_USER = 'logout_user';
const ADD_TO_CART_USER = 'add_to_cart_user';
const GET_CART_ITEMS_USER = 'get_cart_items_user';
const REMOVE_CART_ITEM_USER = 'remove_cart_item_user';
const ON_SUCCESS_BUY_USER = 'on_success_buy_user';
const LOAD_PRODUCTS = "load_products"
const USER_SERVER = '/api/users';
const PRODUCT_SERVER = '/api/product';
const RMRF_FROM_CART = "RMRF_FROM_CART"
const RMRF_ALL_FROM_CART = "RMRF_ALL_FROM_CART"
const DECRISE_FROM_CART = "DECRISE_ALL_FROM_CART"


 function redux (state = {}, action) {

  switch (action.type) {
      case REGISTER_USER:
          return { ...state, register: action.payload }
      case LOGIN_USER:
          return { ...state, loginSucces: action.payload }
      case AUTH_USER:
          return { ...state, userData: action.payload }
      case LOGOUT_USER:
          return { ...state }
      case ADD_TO_CART_USER:
          return {
              ...state, userData:{...state.userData,cart: action.payload}

          }
      case GET_CART_ITEMS_USER:
          return {
              ...state, cartDetail: action.payload
          }
      case REMOVE_CART_ITEM_USER:
          return {
              ...state,
              cartDetail: action.payload.cartDetail,
              userData: {
                  ...state.userData,
                  cart: action.payload.cart
              }

          }
      case ON_SUCCESS_BUY_USER:
          return {
              ...state,
              userData: {
                  ...state.userData,
                  cart: action.payload.cart,
                  history: action.payload.history,
              }
          }
      case RMRF_FROM_CART:
        return {
          ...state, userData:{...state.userData,cart: action.payload.cart}
        }
      case RMRF_ALL_FROM_CART : 
      return {
        ...state, userData: {
          ...state.userData, cart: action.payload.cart
        }
      }
      case DECRISE_FROM_CART : 
      return {
        ...state, userData: {
          ...state.userData, cart: action.payload
        }
      }
      default:
          return state;
  }
}

const rootReducer = combineReducers({
  redux
});

// user_actions


function registerUser(dataToSubmit) {
  const request = axios.post(`${USER_SERVER}/register`, dataToSubmit)
      .then(response => response.data);

  return {
      type: REGISTER_USER,
      payload: request
  }
}


function loginUser(dataToSubmit) {
  const request = axios.post(`${USER_SERVER}/login`, dataToSubmit)
      .then(response => response.data);

  return {
      type: LOGIN_USER,
      payload: request
  }
}

function auth() {
  const request = axios.get(`${USER_SERVER}/auth`)
      .then(response => response.data);

  return {
      type: AUTH_USER,
      payload: request
  }
}

function addToCart(_id) {
  const request = axios.get(`${USER_SERVER}/addToCart?productId=${_id}`)
      .then(response => response.data);

  return {
      type: ADD_TO_CART_USER,
      payload: request
  }
}

function cleanCart(_id) {
  const request = axios.get(`${USER_SERVER}/rmrfFromCart?_id=${_id}`)
      .then(response => response.data);
  return {
      type: RMRF_FROM_CART,
      payload: request
  }
}

function cleanAllCart() {
  const request = axios.get(`${USER_SERVER}/rmrfAllFromCart`)
      .then(response => response.data);
  return {
      type: RMRF_ALL_FROM_CART,
      payload: request
  }
}

function decriseFromCart(_id) {
  const request = axios.get(`${USER_SERVER}/decriseFromCart?productId=${_id}`)
      .then(response => response.data);
      console.log(request)
  return {
      type: DECRISE_FROM_CART,
      payload: request
  }
}



class Paypal extends React.Component {
  render() {
      const onSuccess = (payment) => {
          console.log("The payment was succeeded!", payment);
          this.props.onSuccess(payment);
      
      }

      const onCancel = (data) => {
          console.log('The payment was cancelled!', data);
      }

      const onError = (err) => {
          console.log("Error!", err);
      }

      let env = 'sandbox'; 
      let currency = 'USD'; 
      let total = this.props.toPay; 

      const client = {
          sandbox: 'AfyGTdb67AGvKUAa1kpLTn-s2ycDsk0t2oosnETXZzlBW22-Rzhhgntk7bj-0zDgZvMY3GkkLmwqLaYm',
          production: 'YOUR-PRODUCTION-APP-ID',
      }
     return (
          <PaypalExpressBtn
              env={env}
              client={client}
              currency={currency}
              total={total}
              onError={onError}
              onSuccess={onSuccess}
              onCancel={onCancel}
              style={{ 
                  size:'large',
                  color:'blue',
                  shape: 'rect',
                  label: 'checkout'
              }}
               />
      );
  }
}

function Auth (ComposedClass, reload, adminRoute = null) {
  function AuthenticationCheck(props) {

      let redux = useSelector(state => state.redux);
      const dispatch = useDispatch();

      useEffect(() => {

          dispatch(auth()).then(async response => {
              if (await !response.payload.isAuth) {
                  if (reload) {
                      props.history.push('/login')
                  }
              } else {
                  if (adminRoute && !response.payload.isAdmin) {
                      props.history.push('/')
                  }
                  else {
                      if (reload === false) {
                          props.history.push('/')
                      }
                  }
              }
          })
          
      }, [dispatch, props.history, redux.googleAuth])

      return (
          <ComposedClass {...props} redux={redux} />
      )
  }
  return AuthenticationCheck
}

const createStoreWithMiddleware = applyMiddleware(promiseMiddleware, ReduxThunk)(createStore);

function HeaderCart(props){
  const dispatch = useDispatch()
  let redux = useSelector(state => state.redux);

  return(
    <div className="cart-header-block-shell" >
      <div className="cart-header-block">
      <div className="cart-header-block-buttons">
        <a className="cart-header-block-button" href="/cart">Buy</a>
        <a className="cart-header-block-button" onClick={() => dispatch(cleanAllCart())}>Clean</a>
        <div></div>
        <a className="cart-header-block-button" onClick={() => props.setCartVisib()}>X</a>
      </div>
      <div className="cart-header-block-list-start">
        {redux.userData.cart.length === 0 ? 
        <div className="Cart-is-empty">Cart is empty</div>:
        
        <div className="cart-header-block-list">
          {redux.userData.cart.map((cart,index) => 
            <div key={index} className="cart-header-block-list-element">
            <div id={"carouselProductControls"+index+index} className="carousel slide carousel-fade" data-ride="carousel">

            <div className="carousel-inner">
           { cart.productBody.images.map((image, index) => (
                                     <div key={index+image} className={`d-flex flex-wrap align-items-center align-content-center carousel-item ${index === 0 ? "active" : ""}`}>
                                         <img className="d-block my-auto mx-auto carusel-product-image" 
                                             src={(image.substring(0, 7) === 'uploads') ? `${config.MAGIC_HOST}/${image}` : `${image}`} alt="productImage" />
                                     </div>
                                 ))}
           { cart.productBody.images.length > 1 ? <>
           <a className="carousel-control carousel-control-prev" href={"#carouselProductControls"+index+index} role="button" data-slide="prev">
           <i className="fas fa-angle-left"></i>
           </a>
           <a className="carousel-control carousel-control-next" href={"#carouselProductControls"+index+index} role="button" data-slide="next">
           <i className="fas fa-angle-right"></i>
           </a>
           </> : null
         }
           </div>
           </div>
            <div className="cart-header-block-list-description">
          <div className="cart-header-block-list-description-name">{cart.productBody && cart.productBody.title}</div>
            </div>
            <div className="cart-header-block-list-actions">
              <div className="cart-header-block-list-count">{cart.quantity}</div>
              <div className="cart-header-block-list-add header-list-action" onClick={() => dispatch(addToCart(cart.id))}>+</div>
              <div className="cart-header-block-list-decr header-list-action" onClick={() =>  dispatch(decriseFromCart(cart.id))}>-</div>
              <div className="cart-header-block-list-remove header-list-action" onClick={() => dispatch(cleanCart(cart.id))}><i className="fa fa-trash"></i></div>
            </div>
          </div>
          )}
        </div>

}
      </div>
      </div>
    </div>
  )
}


function NavBar(props) {
  const [cartvisib, setcartvisib] = useState(false);

  const setCartVisib = () => {
    setcartvisib(!cartvisib)
  }
  const logoutHandler = () => {
    axios.get(`${USER_SERVER}/logout`).then(response => {
      if (response.status === 200) {
        props.history.push("/login");
      } else {
        alert('Log Out Failed')
      }
    });
  };
  let redux = useSelector(state => state.redux);
  return(
    <>
<div className="sticky-top">
  <div className="yellow-line">
    <nav className="navbar   navbar-expand-lg ">
  <a href="/" className="navbar-brand">GunstaSHOP</a>
  <button onClick={cartvisib ? setCartVisib : null} className="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
    <i className="fas fa-bars"></i>
  </button>
  <div className="collapse navbar-collapse" id="navbarCollapse">
      {((redux.userData && !redux.userData.isAuth )) ?
       <ul className="navbar-nav ml-auto">
        <li className="navbar-item">
          <a href="/login" className="nav-link">Signin</a>
        </li>
        <li className="navbar-item">
          <a href="/register" className="nav-link">Signup</a>
        </li>
      </ul>
      :
      <ul className="navbar-nav ml-auto">
        <li className="navbar-item">
          <a href="/" className="nav-link">Store</a>
        </li>
        <li className="navbar-item">
          <a href="/history" className="nav-link">History</a>
        </li>
        <li className="navbar-item">
          <Link to="/upload" className="nav-link">Upload</Link>
        </li>
        <li className="navbar-item">
          <a href="/settings" className="nav-link">Settings</a>
        </li>
        <li className="navbar-item">
          <a onClick={logoutHandler} className="nav-link">Log out</a>
        </li>
        
        <li  className="navbar-item">
          
          <a onClick={(e) => setCartVisib() && e.preventDefault()}  id="elm" className="nav-link cart-in-header">
          
          { redux?.userData?.cart?.length ?
          <span className="count_in_store">{redux.userData.cart.length}</span> : null
        }
        <Icon type="shopping-cart" className="cart-link" />
          
            </a>
        </li>
      </ul>
}
  </div>
</nav>
</div>
{ cartvisib &&
<HeaderCart setCartVisib={setCartVisib} cartvisib={cartvisib}/>
}

</div>



<div className="main-bread-crumbs">
      <div className="bread-crumbs">
      <Switch>
        <Route exact path="/" component={() => <><a href="/">Store</a></>} />
        <Route exact path="/upload" component={() => <><a href="/">Store</a> <i className="fa fa-angle-right"></i> <a>Upload</a></>} />
        <Route exact path="/product/:productId" component={() => <><a href="/">Store</a> <i className="fa fa-angle-right"></i> <a >Product</a></>} />
        <Route exact path="/cart" component={() => <><a href="/">Store</a> <i className="fa fa-angle-right"></i> <a >Cart</a></>} />
        <Route exact path="/history" component={() => <><a href="/">Store</a> <i className="fa fa-angle-right"></i> <a >History</a></>} />
        <Route exact path="/settings" component={() => <><a href="/">Store</a> <i className="fa fa-angle-right"></i> <a >Settings</a></>} />

      </Switch> 
      </div>
      </div>
</>
  )
}



















function RegisterPage(props) {
  const dispatch = useDispatch();
  return (

    <Formik
      initialValues={{
        email: '',
        name: '',
        password: '',
        confirmPassword: ''
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string()
          .required('Name is required'),
        email: Yup.string()
          .email('Email is invalid')
          .required('Email is required'),
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password'), null], 'Passwords must match')
          .required('Confirm Password is required')
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {

          let dataToSubmit = {
            email: values.email,
            password: values.password,
            name: values.name,
            image: `http://gravatar.com/avatar/${moment().unix()}?d=identicon`
          };
          dispatch(registerUser(dataToSubmit)).then(response => {
            if (response.payload.success) {
              props.history.push("/login");
            } else {
              alert(response.payload.err.errmsg)
            }
          })

          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const {
          values,
          touched,
          errors,
          dirty,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
          handleReset,
        } = props;
        return (
          <div className="register-form-app">
            <h2>Sign up</h2>
            <Form autoComplete="off" className="register-form" onSubmit={handleSubmit} >

              <Form.Item required className={errors.name && touched.name ?"form-item error" : "form-item"} label="Name">
                <Input
                  id="name"
                  placeholder="Enter your name"
                  type="text"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.name && touched.name ? 'text-input error' : 'text-input'
                  }
                />
                {errors.name && touched.name && (
                  <div className="input-feedback">{errors.name}</div>
                )}
              </Form.Item>
              <Form.Item required className={errors.email && touched.email ?"form-item error" : "form-item"} label="Email">
                <Input
                  id="email"
                  placeholder="Enter your email address for contact with you"
                  type="text"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.email && touched.email ? 'text-input error' : 'text-input'
                  }
                />
                {errors.email && touched.email && (
                  <div className="input-feedback">{errors.email}</div>
                )}
              </Form.Item>
              <Form.Item required className={errors.password && touched.password ?"form-item error" : "form-item"} label="Password">
                <Input
                  id="password"
                  autoComplete="new-password"
                  placeholder="Create Password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.password && touched.password ? 'text-input error' : 'text-input'
                  }
                />
                {errors.password && touched.password && (
                  <div className="input-feedback">{errors.password}</div>
                )}
              </Form.Item>

              <Form.Item required className={errors.confirmPassword && touched.confirmPassword ?"form-item error" : "form-item"} label="Confirm Password">
                <Input
                  id="confirmPassword"
                  placeholder="Submit Password"
                  type="password"
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.confirmPassword && touched.confirmPassword ? 'text-input error' : 'text-input'
                  }
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <div className="input-feedback">{errors.confirmPassword}</div>
                )}
              </Form.Item>

              <Form.Item className="submit-btn">
                <Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        );
      }}
    </Formik>
  );
};


function LoginPage(props) {
  const dispatch = useDispatch();
  const rememberMeChecked = localStorage.getItem("rememberMe") ? true : false;

  const [formErrorMessage, setFormErrorMessage] = useState('')
  const [rememberMe, setRememberMe] = useState(rememberMeChecked);

  const initialEmail = localStorage.getItem("rememberMe") ? localStorage.getItem("rememberMe") : '';
  return (
    <Formik
      initialValues={{
        email: initialEmail,
        password: '',
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email('Email is invalid')
          .required('Email is required'),
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          let dataToSubmit = {
            email: values.email,
            password: values.password
          };

          dispatch(loginUser(dataToSubmit))
            .then(response => {
              if (response.payload.loginSuccess) {
                window.localStorage.setItem('userId', response.payload.userId);
                if (rememberMe === true) {
                  window.localStorage.setItem('rememberMe', values.id);
                } else {
                  localStorage.removeItem('rememberMe');
                }
                props.history.push("/");
              } else {
                setFormErrorMessage('Check out your Account or Password again')
              }
            })
            .catch(err => {
              setFormErrorMessage('Check out your Account or Password again')
              setTimeout(() => {
                setFormErrorMessage("")
              }, 3000);
            });
          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const {
          values,
          touched,
          errors,
          dirty,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
          handleReset,
        } = props;
        return (
          <div className="register-form-app">
            <h2>Log In</h2>
            <Form autoComplete="off"   className="register-form" onSubmit={handleSubmit} >
              <Form.Item autoComplete="new-password" required className={errors.email && touched.email ?"form-item error" : "form-item"} label="Email">
                <Input
                  id="email"
                  autoComplete="new-password"
                  placeholder="Enter your email address for contact with you"
                  type="text"
                  value={values.email ? values.email : ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.email && touched.email ? 'text-input error' : 'text-input'
                  }
                />
                {errors.email && touched.email && (
                  <div className="input-feedback">{errors.email}</div>
                )}
              </Form.Item>
              <Form.Item autoComplete="new-password" autoComplete="off"  required className={errors.password && touched.password ?"form-item error" : "form-item"} label="Password">
                <Input
                  id="password"
                  placeholder="Create Password"
                  type="password"
                  autoComplete="off" 
                  value={values.password ? values.password : ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.password && touched.password ? 'text-input error' : 'text-input'
                  }
                />
                {errors.password && touched.password && (
                  <div className="input-feedback">{errors.password}</div>
                )}
              </Form.Item>

              <Form.Item className="submit-btn">
                <Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        );
      }}
    </Formik>)
}

const TypesOfWeapon = [
  { weapon: 0, value: "Pistol" },
  { weapon: 1, value: "Rifle" },
  { weapon: 2, value: "Assault rifle" },
  { weapon: 3, value: "Submachine gun" },
  { weapon: 4, value: "Armor"},
  { weapon: 5, value: "Ammunition"},
  { weapon: 6, value: "Supplies"},
  { weapon: 7, value: "Aim"},
  { weapon: 8, value: "Cold weapon"},
]
const SortBye = [
  { sby: 0, value: "Default" },
  { sby: 1, value: "From cheap to expensive" },
  { sby: 2, value: "From expensive to cheap" },
]
function LandingPage(props) {

  const [Products, setProducts] = useState([]);
  const [Skip, setSkip] = useState(0)
  const [Page, setPage] = useState(1)

  const [Limit, setLimit] = useState(5)
  const [PostSize, setPostSize] = useState()
  const [SearchTerms, setSearchTerms] = useState("")
  const [MaxPrice, setMaxPrice] = useState(0)
  const [MinPrice, setMinPrice] = useState(0)
  const [SearchMaxPrice, setSearchMaxPrice] = useState(0)
  const [SortBy, setSortBy] = useState('Default')

  let array_for_check = [];
  for(let gg = 0 ; gg < TypesOfWeapon.length; gg++)
    array_for_check.push(false)
  const [WhatWeapon, setWhatWeapon] = useState(array_for_check)
  const dispatch = useDispatch()
  
  useEffect(() => {

    const variables = {
        skip: Skip,
        limit: Limit,
    }
    getProducts(variables)
}, [])


const [lastScrollTop, setLastScrollTop] = useState(0);
  const [bodyOffset, setBodyOffset] = useState(
    document.body.getBoundingClientRect()
  );
  const [scrollY, setScrollY] = useState(bodyOffset.top);
  const [scrollX, setScrollX] = useState(bodyOffset.left);
  const [scrollDirection, setScrollDirection] = useState();

  const listener = e => {
    setBodyOffset(document.body.getBoundingClientRect());
    setScrollY(-bodyOffset.top);
    setScrollX(bodyOffset.left);
    setScrollDirection(lastScrollTop > -bodyOffset.top ? "down" : "up");
    setLastScrollTop(-bodyOffset.top);
  };

  useEffect(() => {
    window.addEventListener("scroll", listener);
    return () => {
      window.removeEventListener("scroll", listener);
    };
  });




const getProducts = (variables) => {
  
  Axios.post('/api/product/getProducts', variables)
      .then(response => {
          if (response.data.success) {
              if (variables.loadMore) {
                  setProducts([...Products, ...response.data.products])
              } else {
                  setProducts(response.data.products)

              }
              setPostSize(response.data.postSize)
              if(response.data.maxPrice && response.data.maxPrice[0] ){
                setMaxPrice(response.data.maxPrice[0].price)
              }
          } else {
              alert('Failed to fectch product datas')
          }
      })
}
const onLoadMore = () => {
  let skip = Skip + Limit;

  const variables = {
    skip: skip,
    weapon: WhatWeapon,
    SortBy: SortBy,
    min_price: MinPrice,
    max_price: SearchMaxPrice,
    loadMore: true,
    limit: Limit,
    searchTerm: SearchTerms
  }
  console.log(variables)
  getProducts(variables)
  setSkip(skip)
}


const updateSearchTerms = (newSearchTerm) => {
  const variables = {
      skip: 0,
      weapon: WhatWeapon,
      SortBy: SortBy,
      min_price: MinPrice,
      max_price: SearchMaxPrice,
      limit: Limit,
      searchTerm: newSearchTerm
  }

  setSkip(0)
  setSearchTerms(newSearchTerm)
  getProducts(variables)
}

const updateMinCost = (e) => {
  console.log(e)
if(allow_in1sec || e.target.value == 0) {
  allow_in1sec = 0;
  const variables = {
    skip: 0,
    weapon: WhatWeapon,
    limit: Limit,
    SortBy: SortBy,
    min_price: e.target.value,
    max_price: SearchMaxPrice,
    searchTerm: SearchTerms
}
setSkip(0)
setMinPrice(e.target.value)
getProducts(variables)
}

}

const updateMaxCost = (e) => {
  console.log(e)
if(allow_in1sec || e.target.value == 0) {
  allow_in1sec = 0;
  const variables = {
    skip: 0,
    weapon: WhatWeapon,
    SortBy: SortBy,
    limit: Limit,
    min_price: MinPrice,
    max_price: e.target.value,
    searchTerm: SearchTerms
}
setSkip(0)
setSearchMaxPrice(e.target.value)
getProducts(variables)
}

}

const set_checked_t = (w) => {
  
  let arr = WhatWeapon;
  arr[w] = !arr[w];
  setWhatWeapon(arr)
  
  const variables = {
    skip: 0,
    weapon: WhatWeapon,
    SortBy: SortBy,
    limit: Limit,
    min_price: MinPrice,
    max_price: SearchMaxPrice,
    searchTerm: SearchTerms
}
setSkip(0)

getProducts(variables)
}

const onSortByChange = (event) => {
  const variables = {
    skip: 0,
    weapon: WhatWeapon,
    SortBy: event.currentTarget.value,
    limit: Limit,
    min_price: MinPrice,
    max_price: SearchMaxPrice,
    searchTerm: SearchTerms
}
setSortBy(event.currentTarget.value)
setSkip(0)

getProducts(variables)

}
  return(
    <div className="main-page-store-shell">
    <div className="main-page-store">
      <div className="main-page-filters">
        <div className="main-page-search">
          <input value={SearchTerms} placeholder="Search by name" className="main-page-term-search" onChange={(e) => updateSearchTerms(e.target.value)} />
        </div>
        <div className="main-page-price">
        <div className="main-page-range-filter-block">
           <input type="number" placeholder="Min" min={0} value={MinPrice == 0? "" : MinPrice} max={SearchMaxPrice} onChange={(e) => updateMinCost(e)}/><input type="number" placeholder="Max" value={SearchMaxPrice == 0? "" : SearchMaxPrice} onChange={(e) => updateMaxCost(e)} min={MinPrice} max={MaxPrice}/>
        </div> 
        </div>
        <div className="main-page-sort">
        <select onChange={onSortByChange} className="main-page-select-search" value={SortBy}>
          {SortBye.map((item, index) => (
              <option key={item.index + item.value} >{item.value} </option>
          ))}
        </select>
        </div>
        <ul className="main-page-checkout">
        {TypesOfWeapon.map((weapon, index) => <li key={weapon.value}>
          <input id={weapon.value+weapon.weapon} type="checkbox" onChange={() => set_checked_t(index) } checked={WhatWeapon[index]}/>
            <label htmlFor={weapon.value+weapon.weapon} className="checkbox">{weapon.value}</label>  
          </li>)}
        </ul>
      </div>
      <div className="main-page-products">
      {Products.length === 0 ? 
        <div className="no-post-yet" style={{ display: 'flex', height: '300px', justifyContent: 'center', alignItems: 'center' }}>
          <h2>No post yet...</h2>
        </div> :<>

        <ul className="main-page-list-of-products">
          {
            Products.map((product, index) => <li key={index} className="main-page-product-element">
              <div id={"carouselProductControls"+index} className="carousel slide carousel-fade" data-ride="carousel">
                         <div className="carousel-inner">
                         {product.images.map((image, index) => (
                                                   <div key={index+image} className={`d-flex flex-wrap align-items-center align-content-center carousel-item ${index === 0 ? "active" : ""}`}>
                                                       <img className="d-block  mx-auto carusel-product-image" 
                                                           src={(image.substring(0, 7) === 'uploads') ? `${config.MAGIC_HOST}/${image}` : `${image}`} alt="productImage" />
                                                   </div>
                                               ))}
                         </div>
                         {product.images.length > 1 ? <>
                         <a className="carousel-control carousel-control-prev" href={"#carouselProductControls"+index} role="button" data-slide="prev">
                         <i className="fas fa-angle-left"></i>
                         </a>
                         <a className="carousel-control carousel-control-next" href={"#carouselProductControls"+index} role="button" data-slide="next">
                         <i className="fas fa-angle-right"></i>
                         </a>
                         </> : null
                       }
                       </div>
                       <div className="main-page-title">
                <a href={`/product/${product._id}`} >{product.title.length < 50 ? product.title :    product.title.substr(0,50)+'...'
}</a>
</div>
                <div className="main-page-cost-of-element">$ {product.price}</div>

              </li>
          )}
          
        </ul>
        <ul className="main-page-list-of-btns">
        { Products.length < PostSize  ?
        <li>
          <button className="main-page-btn-1" onClick={onLoadMore}>Load More</button>
        </li> : null
        }
        { scrollY  >100 && window.scrollY > 10 ?
        <li>
          {console.log(scrollY)}
          <button className="main-page-btn-2" onClick={() => window.scrollTo(0, 0)}>Scroll on top</button>
        </li> : null
        }
        </ul>
        </>
        }
      </div>
    </div>
    </div>
  )
}
function FileUpload(props) {

  const [Images, setImages] = useState([])
  const [imageInput, setImageInput] = useState('')

  const onDrop = (files) => {

      let formData = new FormData();
      const config = {
          header: { 'content-type': 'multipart/form-data' }
      }
      formData.append("file", files[0])
      //save the Image we chose inside the Node Server 
      axios.post('/api/product/uploadImage', formData, config)
          .then(response => {
              if (response.data.success) {
                  setImages([...Images, response.data.image])
                  props.refreshFunction([...Images, response.data.image])
              } else {
                  alert('Failed to save the Image in Server')
              }
          })
  }


  const onDelete = (image) => {
      const currentIndex = Images.indexOf(image);

      let newImages = [...Images]
      newImages.splice(currentIndex, 1)

      setImages(newImages)
      props.refreshFunction(newImages)
  }
 
  const addLinkImg = () => {
    setImages([...Images, imageInput])
    props.refreshFunction([...Images, imageInput])
    setImageInput('')
  }

  return (
    <>
      <div className="image-uploader" >
          <Dropzone
              onDrop={onDrop}
              multiple={false}
              maxSize={800000000}
          >
              {({ getRootProps, getInputProps }) => (
                  <div className="dropzone"
                      {...getRootProps()}
                  >
                      <input {...getInputProps()} />
                      <Icon type="plus" style={{ fontSize: '3rem' }} />

                  </div>
              )}
          </Dropzone>

          <div className="upload-images" style={{ display: 'flex',  height: '240px', overflowX: 'scroll' }}>

              {Images.map((image, index) => (
                      <img key={index+`${config.MAGIC_HOST}/${image}`} onClick={() => onDelete(image)} src={(image.substring(0, 7) === 'uploads') ? `${config.MAGIC_HOST}/${image}` : `${image}`} alt={`productImg-${index}`} />
              ))}


          </div>

      </div>
      <div className="input-image-link">
      <input value={imageInput} placeholder="Because hosting is free, files are deleted after 15 minutes, so upload links of image"  onChange={(e) => setImageInput(e.target.value)}/> <button  onClick={addLinkImg} type="button">Set image link</button>
      </div>
    </>
  )
}
function UploadProductPage(props) {
    const [TitleValue, setTitleValue] = useState("")
    const [DescriptionValue, setDescriptionValue] = useState("")
    const [PriceValue, setPriceValue] = useState(0)
    const [WeaponValue, setWeaponValue] = useState(1)
    const [Images, setImages] = useState([])

    const onTitleChange = (event) => {
      setTitleValue(event.currentTarget.value)
    } 
    const onDescriptionChange = (event) => {
      setDescriptionValue(event.currentTarget.value)
    }
    const onPriceChange = (event) => {
      setPriceValue(event.currentTarget.value)
    }
    const onWeaponSelectChange = (event) => {
      setWeaponValue(event.currentTarget.value)
    }
    const updateImages = (newImages) => {
    setImages(newImages)
    }

    const onSubmit = (event) => {
      event.preventDefault();


      if (!TitleValue || !DescriptionValue || !PriceValue ||
          !WeaponValue || !Images) {
          return alert('Fill all the fields first!')
      }

      const variables = {
          writer: props.redux.userData._id,
          title: TitleValue,
          description: DescriptionValue,
          price: PriceValue,
          images: Images,
          weapon: WeaponValue
      }


      Axios.post('/api/product/uploadWeapon', variables)
          .then(response => {
              if (response.data.success) {
                  alert('Product Successfully Uploaded')
                  props.history.push('/')
              } else {
                  alert('Failed to upload Product')
              }
          })

  }

  return (
    <div className="upload-product">
      <h2 className="upload-logo">Uploading</h2>
      <Form className="upload-form" onSubmit={onSubmit} >

                {/* DropZone */}
                <FileUpload refreshFunction={updateImages} />
                <div className="upload-input">
                <label>Title</label>
                <Input
                    onChange={onTitleChange}
                    value={TitleValue}
                />
                </div>
                <div className="upload-input">

                <label>Description</label>
                <TextArea
                    onChange={onDescriptionChange}
                    value={DescriptionValue}
                />
                </div>
                <div className="upload-input">

                <label>Price($)</label>
                <Input
                    onChange={onPriceChange}
                    value={PriceValue}
                    type="number"
                />
                </div>
                <div className="upload-input">

                <label>Type</label>
                <select onChange={onWeaponSelectChange} value={WeaponValue}>
                    {TypesOfWeapon.map(item => (
                        <option key={item.weapon} value={item.weapon}>{item.value} </option>
                    ))}
                </select>
                </div>
                <Button className="submit-upload-btn"
                    onClick={onSubmit}
                >
                    Submit
                </Button>

            </Form>
    </div>
    

  )
}

function My404Component(){
  return<div>404</div>
}

function Footer () {
  return<footer className="footer-main">
    <div className="footer-top">
      <div className="footer-top-left">
        <div className="footer-top-left-logo">GunstaSHOP</div>
        <div className="footer-top-left-icons">
          <ul>
            <li>
              <a href="#">
                <i className="fab fa-instagram"></i>
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fab fa-youtube"></i>
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fab fa-telegram"></i>
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fab fa-facebook"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-top-right">
        <img src="https://paypalinfo.com.ua/wp-content/uploads/2019/04/paypal_2014_logo.svg_.png" />
      </div>
    </div>
    <div className="copiright-footer">© Сreated by <a href="#">Bashenko Mykyta</a> <a href="#">Source code</a></div>
  </footer>
}

function DetailProductPage(props){
  let was_in_cart = 0;
  let redux = useSelector(state => state.redux);
  console.log(redux)
  const dispatch = useDispatch();
  const User = useSelector(store => store.redux);

  const productId = props.match.params.productId
  let count_in_cart = 0;

  redux.userData && redux.userData.cart && redux.userData.cart.map((cart) => cart.id === productId ? count_in_cart = cart.quantity : null)

  const [Product, setProduct] = useState([])
  const [CommentInput, setCommentInput] = useState("")
  useEffect(() => {
    Axios.get(`/api/product/products_by_id?id=${productId}&type=single`)
        .then(response => {
              setProduct(response.data[0])
              console.log(response.data[0])
          })

  }, [])


  const updatePage = () => {
    Axios.get(`/api/product/products_by_id?id=${productId}&type=single`)
      .then(response => {
            setProduct(response.data[0])
        })
  }

  const submitComent = () => {
    const variables = {
      _id: Product._id,
      writer: Product.writer._id,
      title: Product.title,
      description: Product.description,
      price: Product.price,
      images: Product.images,
      weapon: Product.weapon,
      coments: [...Product.coments, {comment:CommentInput, who_write_comment:User.userData.email}]
  }
  setCommentInput("")

  Axios.post(`/api/product/uploadWeapon/${productId}`, variables)
  .then(response => {
    updatePage()
  })
      

  }

  return (
  Product.length !== 0  ?

  <div className="detail-page">
    <div  className="detail-page-body">
    <div className="detail-page-logo">
      {Product.title}
    </div>
    <div className="detail-page-body-image">
    <div id={"carouselProductControls"} className="carousel slide carousel-fade" data-ride="carousel">
           <div className="carousel-inner">
           {Product.images.map((image, index) => (
                                     <div key={index+image} className={`d-flex flex-wrap align-items-center align-content-center carousel-item ${index === 0 ? "active" : ""}`}>
                                         <img className="d-block my-auto mx-auto carusel-product-image" 
                                             src={(image.substring(0, 7) === 'uploads') ? `${config.MAGIC_HOST}/${image}` : `${image}`} alt="productImage" />
                                     </div>
                                 ))}
           </div>
           {Product.images.length > 1 ? <>
           <a className="carousel-control carousel-control-prev" href={"#carouselProductControls"} role="button" data-slide="prev">
           <i className="fas fa-angle-left"></i>
           </a>
           <a className="carousel-control carousel-control-next" href={"#carouselProductControls"} role="button" data-slide="next">
           <i className="fas fa-angle-right"></i>
           </a>
           </> : null
         }
         </div>
      </div>
      <div className="detail-page-description mb-2">{Product.description}</div>
         <div className="detail-page-type mb-2">Type: {TypesOfWeapon.map((from_client) =>
            from_client.weapon === Product.weapon ? from_client.value : null
         )}</div>
         <div className="detail-page-type mb-2">Seller: {Product.writer.email}</div>
         <div className="detail-page-price">{Product.price} $</div>
         <div className="detail-page-btns-for-cart">
          { was_in_cart = 0,
          props.redux.userData && props.redux.userData.cart &&
                        props.redux.userData.cart.map((product_in_cart) => product_in_cart.id === Product._id ? was_in_cart = 1 : null),
                        was_in_cart === 1    ? <div className="detail-page-btn-action-with-cart">
          <div className="detail-page-btn-actions">
          <div className="detail-page-btn-action-add header-list-action" onClick={() => dispatch(addToCart(Product._id))}>+</div>
          <div className="cart-header-block-list-count">{count_in_cart}</div>
          <div className="detail-page-btn-action-decr header-list-action" onClick={() => dispatch(decriseFromCart(productId))}>-</div>
          <div className="cart-header-block-list-remove header-list-action" onClick={() => dispatch(cleanCart(productId))}><i className="fa fa-trash"></i></div>
          </div>
            <a className="detail-page-btn-action-goto-cart" href="/cart">Buy</a>

          </div> :
          <div className="detail-page-btn-add-to-cart">
            <button onClick={() => dispatch(addToCart(Product._id))}>
               Add to cart
            </button>
          </div>}
         </div>
         </div>
         <div className="detail-page-coments">
         <div className="detail-page-coments-input-and-btn">
         <input className="detail-page-coments-input" value={CommentInput} onChange={(e) => setCommentInput(e.target.value)} />
         <button onClick={submitComent} className="detail-page-coments-btn">Set comment</button>
         </div>
         {
            Product.coments.length ?
         <div className="coments">
           {
             Product.coments.map((c,index) => 
           <div className="detail-page-coments-coment" key={index+c.who_write_comment}><div className="detail-page-coments-who_write_comment">{c.who_write_comment}</div><div className="detail-page-coments-comment">{c.comment}</div></div>
            )
           }
         </div>: null
         }
     </div>
  </div>: null
  )
  
}

export function onSuccessBuy(data) {

  const request = axios.post(`${USER_SERVER}/successBuy`, data)
      .then(response => response.data);
  console.log(request)
  return {
      type: ON_SUCCESS_BUY_USER,
      payload: request
  }
}

function CartPage(props) {
  const dispatch = useDispatch();
  const [Total, setTotal] = useState(0)
  const [ShowTotal, setShowTotal] = useState(false)
  const [ShowSuccess, setShowSuccess] = useState(false)
  
  let redux = useSelector(state => state.redux);
  
  const calculateTotal = () => {
  let total = 0;

  redux.userData && redux.userData.cart && redux.userData.cart.map(cartItem => 
    total += parseInt(cartItem.productBody.price,10) * cartItem.quantity

  )
  setTotal(total)
  setShowTotal(true)
}


const transactionSuccess = (data) => {
  dispatch(onSuccessBuy({
      cartDetail: redux.userData.cart,
      paymentData: data
  }))
      .then(response => {
          if (response.payload.success) {
              setShowSuccess(true)
              setShowTotal(false)
          }
      })
}


useEffect(() => {

  calculateTotal()

}, [redux])
const transactionError = () => {
  console.log('Paypal error')
}

const transactionCanceled = () => {
  console.log('Transaction canceled')
}

return (

  <div className="cart">
    <div>Cart</div>
    <div className="cartTable">
      {redux?.userData?.cart?.map((cartItem, index) => 
        <div className="cartTableRow" key={index}>
          <div id={"carouselProductControls"+index+index} className="carousel slide carousel-fade" data-ride="carousel">

          <div className="carousel-inner">
          { cartItem.productBody.images.map((image, index) => (
                                  <div key={index+image} className={`d-flex flex-wrap align-items-center align-content-center carousel-item ${index === 0 ? "active" : ""}`}>
                                      <img className="d-block my-auto mx-auto carusel-product-image" 
                                          src={(image.substring(0, 7) === 'uploads') ? `${config.MAGIC_HOST}/${image}` : `${image}`} alt="productImage" />
                                  </div>
                              ))}
          { cartItem.productBody.images.length > 1 ? <>
          <a className="carousel-control carousel-control-prev" href={"#carouselProductControls"+index+index} role="button" data-slide="prev">
          <i className="fas fa-angle-left"></i>
          </a>
          <a className="carousel-control carousel-control-next" href={"#carouselProductControls"+index+index} role="button" data-slide="next">
          <i className="fas fa-angle-right"></i>
          </a>
          </> : null
          }
          </div>
  </div>
        <div className="cartItemTitle">{cartItem.productBody.title}</div>
        <div className="cartItemCostQuant"><div>{cartItem.quantity}</div><div>{cartItem.quantity * cartItem.productBody.price} $</div></div>
        <div className="cartItemActionShell">
        <div className="cartItemAction">
        <div className="cart-header-block-list-add header-list-action" onClick={() => dispatch(addToCart(cartItem.id))}>+</div>
              <div className="cart-header-block-list-decr header-list-action" onClick={() =>  dispatch(decriseFromCart(cartItem.id))}>-</div>
              <div className="cart-header-block-list-remove header-list-action" onClick={() => dispatch(cleanCart(cartItem.id))}><i className="fa fa-trash"></i></div>  
        </div>
        </div>

        </div>
      )}
    </div>
    <div className="PayPalBtn">
{ShowTotal && Total !== 0? 
        <><div>Total amount: {Total} </div>
        
        <Paypal
                    toPay={Total}
                    onSuccess={transactionSuccess}
                    transactionError={transactionError}
                    transactionCanceled={transactionCanceled}
                />
        
        </>:
        ShowSuccess ? 
        <div>All okey</div>:
        <div>Cart is Empty</div>
      }
    </div>

  </div>

)

}

function HistoryPage(props) {
  let redux = useSelector(state => state.redux);
  
  return (
    <div className="HistoryPage">
      <div className="historyLogo">History</div>
      <div className="historyTable">
      <div className="historyRow">
          <div>ID</div>
          <div>Name</div>
          <div>Price</div>
          <div>Date</div>
          <div>Email</div>
        </div>
      {redux?.userData?.history?.map((item, index) => <div className="historyRow" key={index+item.id+item.id}>
          <div>{item.id}</div>
          <div>{item.name}</div>
          <div>{item.price}</div>
          <div>{Date(item.dateOfPurchase * 1000)}</div>
          <div>{item.writer.email}</div>
        </div>)}
        </div>
    </div>
  )
}

function changePassword(dataToSubmit) {
  return  axios.post(`${USER_SERVER}/changePassword`, dataToSubmit)
      .then(response => response.data);
}

function SettingsPage (props) {
  let redux = useSelector(state => state.redux);
  const [Products, setProducts] = useState([])
  const [SearchProducts, setSearchProducts] = useState([])

  const rmrfFromProducts = (idid) => {
    Axios.get(`/api/product/rmrfProduct?userId=${redux.userData._id}&productId=${idid}`).then(response => {
      setProducts(response.data)
  })
  }

  const getUserProducts = (e) => {
    setSearchProducts(e.target.value)

    Axios.get(`/api/product/getUserProducts?userId=${redux.userData._id}&term=${e.target.value}`).then(response => {
      setProducts(response.data)
    })

  } 

  useEffect(() => {
    if(redux?.userData?._id){
    Axios.get(`/api/product/getUserProducts?userId=${redux.userData._id}`)
        .then(response => {
              setProducts(response.data)
          })
        }
  }, [redux])

  return (

    <Formik
      initialValues={{
        password: '',
        confirmPassword: ''
      }}
      validationSchema={Yup.object().shape({
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password'), null], 'Passwords must match')
          .required('Confirm Password is required')
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {

          let dataToSubmit = {
            id: redux.userData._id,
            password: values.password,
          };
          changePassword(dataToSubmit).then(response => {
              alert("changed")
          })

          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const {
          values,
          touched,
          errors,
          dirty,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
          handleReset,
        } = props;
        return (
          <div className="settings-app">
            <h2>Settings</h2>
            <h4>Change Password</h4>

            <Form autoComplete="off" className="register-form" onSubmit={handleSubmit} >
              <Form.Item required className={errors.password && touched.password ?"form-item error" : "form-item"} label="Password">
                <Input
                  id="password"
                  autoComplete="new-password"
                  placeholder="Create Password"
                  type="password" 
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.password && touched.password ? 'text-input error' : 'text-input'
                  }
                />
                {errors.password && touched.password && (
                  <div className="input-feedback">{errors.password}</div>
                )}
              </Form.Item>

              <Form.Item required className={errors.confirmPassword && touched.confirmPassword ?"form-item error" : "form-item"} label="Confirm Password">
                <Input
                  id="confirmPassword"
                  placeholder="Submit Password"
                  type="password"
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.confirmPassword && touched.confirmPassword ? 'text-input error' : 'text-input'
                  }
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <div className="input-feedback">{errors.confirmPassword}</div>
                )}
              </Form.Item>

              <Form.Item className="submit-btn">
                <Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
            <h4 className="logo-setttings-delete-logo">Delete Your Products</h4>

            <div className="deleteBtns">
              <input placeholder="Find your product" value={SearchProducts} onChange={(e) =>  getUserProducts(e)} />
              {Products.map((item, index) => <div className="delete-row" key={index}>
                <div>{item.title}</div>
<button onClick={() => rmrfFromProducts(item._id)}>
  X
  </button>                
                 </div>)}
            </div>
          </div>
        );
      }}
    </Formik>
  );
};


function App(props) {
  return (
    <Suspense fallback={(<div>Loading...</div>)}>
      
      <div className="main-div" style={{  minHeight: 'calc(100vh - 175px)' }}>
      <Route path="/" component= {NavBar} />
         <Switch>
          <Route exact path="/" component={Auth(LandingPage, null)} />
          <Route exact path="/register" component={Auth(RegisterPage, false)} />
          <Route exact path="/login" component={Auth(LoginPage, false)} />
          <Route exact path="/upload" component={Auth(UploadProductPage, true)} />
          <Route exact path="/product/:productId" component={Auth(DetailProductPage, true)} />
          <Route exact path="/cart" component={Auth(CartPage, true)} />
          <Route exact path="/history" component={Auth(HistoryPage, true)} />
          <Route exact path="/settings" component={Auth(SettingsPage, true)} />
          <Route path='*' exact={true} component={My404Component} />
        </Switch>
        </div>
      <Footer/>

        </Suspense>
  );
}



ReactDOM.render(
  <Provider
      store={createStoreWithMiddleware(
          rootReducer,
          window.__REDUX_DEVTOOLS_EXTENSION__ &&
          window.__REDUX_DEVTOOLS_EXTENSION__()
      )}
  >
      <BrowserRouter>
      <Switch>
        <Route  path="/" component={App} />
      </Switch>
      </BrowserRouter>
  </Provider>
  , document.getElementById('root'));
serviceWorker.unregister();