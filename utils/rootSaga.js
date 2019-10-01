import { all, fork } from 'redux-saga/effects';
// Saga
import LoginSaga from '../screens/Login/saga';
import HomeSaga from '../screens/Home/saga';
import ChannelSaga from '../screens/Channel/saga';
import FeedsSaga from '../screens/Feed/saga';
import BookmarkSaga from '../screens/Bookmark/saga';
import DownloadSaga from '../screens/Download/saga';
import SettingSaga from '../screens/Setting/saga';
import MainSaga from '../Saga';
import CarouselSaga from '../screens/Carousel/saga';
import RegisterSaga from '../screens/Register/saga';
import SearchSaga from '../screens/Search/saga';

export default function* rootSaga() {
  yield all([
    fork(LoginSaga),
    fork(HomeSaga),
    fork(ChannelSaga),
    fork(FeedsSaga),
    fork(BookmarkSaga),
    fork(DownloadSaga),
    fork(SettingSaga),
    fork(MainSaga),
    fork(CarouselSaga),
    fork(RegisterSaga),
    fork(SearchSaga),
  ]);
}
