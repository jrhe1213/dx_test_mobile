import {
  call,
  put,
  takeLatest,
  select,
} from 'redux-saga/effects';
import { AsyncStorage } from 'react-native';

// Library
import Storage from 'react-native-storage';

// Actions
import actions from './actions';

// Constants
import constants from './constants';

// Filesystem
import {
  downloadZip,
  deleteFile,
} from '../../utils/fileSystem';

// Selectors
import * as selectors from '../../utils/selector';

// config
import config from '../../config';

// Helpers
import { getCurrentDateTime } from '../../helpers';

// Utils
import Alert from '../../utils/alert';


export default function* CarouselSaga() {

}
