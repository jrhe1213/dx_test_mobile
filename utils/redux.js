import {
  createReactNavigationReduxMiddleware,
  createReduxBoundAddListener,
} from 'react-navigation-redux-helpers';
import createSagaMiddleware from 'redux-saga';

const middleware = createReactNavigationReduxMiddleware(
  'root',
  state => state.nav,
);

const sagaMiddleware = createSagaMiddleware();

export {
  middleware,
  sagaMiddleware,
};