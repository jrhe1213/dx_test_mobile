import { createStore, applyMiddleware, compose } from 'redux';
import promiseMiddlware from 'redux-promise-middleware'
import logger from 'redux-logger'
import AppReducer from '../reducers';
import { middleware, sagaMiddleware } from '../utils/redux';
import rootSaga from '../utils/rootSaga';

const middlewares = [
  promiseMiddlware(),
  middleware,
  sagaMiddleware,
];

if(__DEV__){
  middlewares.push(logger)
}

const enhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
  AppReducer, 
  undefined,
  enhancers(applyMiddleware(...middlewares))
);

sagaMiddleware.run(rootSaga);

export default store;