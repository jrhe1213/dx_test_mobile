import md5 from 'md5';
import { Platform, Dimensions } from 'react-native';
import moment from 'moment';
import jwtDecode from 'jwt-decode';

export const isObjectEmpty = (myObject) => {
  for (const key in myObject) {
    if (myObject.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

export const truncate = (data, maxLength) => {
  const shortFunFact = data.substring(0, maxLength);
  return `${shortFunFact}...`;
};

export const isValidateEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const hash = password => md5(password);


export const validateVideoPlatform = (url) => {
  if (!url) {
    return null;
  }

  const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/i;
  const vimeoRegex = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;

  const isYoutube = url.match(youtubeRegex);
  const isVimeo = url.match(vimeoRegex);

  if (!isYoutube && !isVimeo) {
    return null;
  }

  const videoIDRegex = /^.*((youtu.be\/|vimeo.com\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  const match = url.match(videoIDRegex);
  let videoID;
  if (match && match[7]) {
    videoID = match[7];
    if (isYoutube) {
      return {
        type: 'YOUTUBE',
        videoID,
      };
    } if (isVimeo) {
      const i = videoID.lastIndexOf('/');
      return {
        type: 'VIMEO',
        videoID: videoID.substr(i + 1),
      };
    }
  } else {
    return null;
  }
};


// Target Iphone X
export const headerForIphoneX = Dimensions.get('window').width >= 375 && Dimensions.get('window').height >= 800 && Platform.OS === 'ios';

// Format strong/ em in html source
export const formatHtmlContent = (html) => {
  const strongRegex = /<strong class="[^"]*"/gm;
  const emRegex = /<em class="[^"]*"/gm;

  html = html.replace(strongRegex, '<strong');
  html = html.replace(emRegex, '<em');
  return html;
};

// Date time format
export const getCurrentDateTime = (dateTime) => {
  let formattedDateTime;

  if (dateTime) {
    formattedDateTime = moment(dateTime).utc().format('YYYY-MM-DDTHH:mm:ss.SSSSZ');
  } else {
    formattedDateTime = moment().utc().format('YYYY-MM-DDTHH:mm:ss.SSSSZ');
  }

  return formattedDateTime;
};

export const getUtcCurrentDateTime = () => {
  return moment();
};

export const dateTimeByParams = (sec) => {
  return moment().add(sec, 'seconds').utc().format('YYYY-MM-DDTHH:mm:ss.SSSSZ');
};

export const crashlyticsRecord = (crashlytics, domain, location, type, method, message) => {

  if (!domain
    || !location
    || !type
    || !method
    || !message
    || !is_string(() => domain)
    || !is_string(() => location)
    || !is_string(() => type)
    || !is_string(() => method)
  ) {
    return;
  }

  if (Platform.OS === 'ios') {
    crashlytics.recordError({
      domain,
      location,
      type,
      method,
      message: JSON.stringify(message),
    });
  } else {
    const obj = {
      domain,
      location,
      type,
      method,
      message: JSON.stringify(message),
    };
    crashlytics.logException(JSON.stringify(obj));
  }
};

const is_string = value => {
  try {
    return typeof value() === 'string';
  } catch (error) {
    return false;
  }
};

export const imageAlg = (formattedWidth, formattedHeight, maxWidth, maxHeight) => {
  // Ratio
  const ratio = formattedWidth / formattedHeight;
  let tmpWidth = 0; let tmpHeight = 0;
  if (ratio > 1) { // 1
    if (formattedWidth > maxWidth) { // 1.1
      tmpWidth = maxWidth;
      tmpHeight = tmpWidth / ratio;
      if (tmpHeight > maxHeight) {
        tmpHeight = maxHeight;
        tmpWidth = tmpHeight * ratio;
      }
    } else { // 1.2
      tmpWidth = formattedWidth;
      tmpHeight = tmpWidth / ratio;
      if (tmpHeight > maxHeight) {
        tmpHeight = maxHeight;
        tmpWidth = tmpHeight * ratio;
      }
    }
  } else { // 2
    if (formattedHeight > maxHeight) { // 2.1
      tmpHeight = maxHeight;
      tmpWidth = tmpHeight * ratio;
      if (tmpWidth > maxWidth) {
        tmpWidth = maxWidth;
        tmpHeight = tmpWidth / ratio;
      }
    } else { // 2.2
      tmpHeight = formattedHeight;
      tmpWidth = tmpHeight * ratio;
      if (tmpWidth > maxWidth) {
        tmpWidth = maxWidth;
        tmpHeight = tmpWidth / ratio;
      }
    }
  }
  return {
    tmpWidth,
    tmpHeight,
  }
}

export const parseJwt = (token) => {
  return jwtDecode(token);
};




export const assembleTree = (experiencePages, completionArr, audioCompletionArr) => {
  if (!experiencePages) {
    return null;
  }

  // Format pages
  let isExperienceStreamCompleted = __format_pages(experiencePages, completionArr, audioCompletionArr);

  // Root page arrange to begin
  __arrange_root_page(experiencePages);
  // Treeify pages
  let tree = __treeify(experiencePages);

  if (!tree.length) {
    return null;
  }

  if (tree[0]) {
    tree[0].IsContent = false;
  }
  tree[0].IsCompleted = isExperienceStreamCompleted;
  return tree[0];
}


const __format_pages = (pages, completionArr, audioCompletionArr) => {
  // Update audio current time from audio completion arr
  for(let i = 0; i < audioCompletionArr.length; i++){
    let audio = audioCompletionArr[i];

    let pageArr = pages.filter(item => item.ExperiencePageGUID == audio.ExperiencePageGUID);
    if (pageArr.length){
      let page = pageArr[0];
      
      let sectionArr = page.Sections.filter(item => item.SectionGUID == audio.SectionGUID);
      if (sectionArr.length){

        let section = sectionArr[0];
        section.CurrentTime = audio.CurrentTime;
      }
    }
  }

  let isExperienceStreamCompleted = true;
  for (let i = 0; i < pages.length; i++) {
    let page = pages[i];

    if (completionArr.includes(page.PageGUID)) {
      pages[i].IsCompleted = true;
    }
    if (!pages[i].IsCompleted) {
      isExperienceStreamCompleted = false;
    }

    // 1. format mobile view
    for (let j = 0; j < page.Sections.length; j++) {
      pages[i].Sections[j].IsContent = true;
      if (completionArr.includes(pages[i].Sections[j].SectionGUID)) {
        pages[i].Sections[j].IsCompleted = true;
      }
    }
    if (page.IsSplash) {
      for (let j = 0; j < page.Sections.length; j++) {
        let section = page.Sections[j];
        if (section.Type == "SPLASH") {
          page.SplashImg = section.SplashImg;
          page.SplashHeight = section.Height;
          page.SplashWidth = section.Width;
          page.SplashContent = section.SplashContent;
          page.SplashColor = section.SplashColor;
          page.SplashOpacityColor = section.SplashOpacityColor;
          page.SplashOpacity = section.SplashOpacity;
          page.IsSplashImageEnabled = section.IsSplashImageEnabled;
          page.ImgBgType = section.ImgBgType;
          page.ImgBgColor = section.ImgBgColor;
          pages[i].Sections.splice(j, 1);
          break;
        }
      }
    }    
  }
  return isExperienceStreamCompleted;
};

const __arrange_root_page = pages => {
  let rootPage, rootIndex;
  for (let i = 0; i < pages.length; i++) {
    let page = pages[i];
    if (page.IsRoot) {
      rootPage = page;
      rootIndex = i;
    }
  }
  if (rootPage) {
    pages.splice(rootIndex, 1);
    pages.unshift(rootPage);
  }
};

const __treeify = (list, idAttr, parentAttr, childrenAttr) => {
  // flat array to tree structure
  if (!idAttr) idAttr = "PageGUID";
  if (!parentAttr) parentAttr = "ParentPageGUID";
  if (!childrenAttr) childrenAttr = "Sections";
  let treeList = [];
  let lookup = {};
  list.forEach(obj => {
    lookup[obj[idAttr]] = obj;
  });
  list.forEach(obj => {
    if (obj[parentAttr] != null) {
      // replace button connector with page
      let index = __find_index_of_sections(
        lookup[obj[parentAttr]][childrenAttr],
        obj
      );
      obj.IsContent = false;
      obj.SectionGUID = lookup[obj[parentAttr]][childrenAttr][index].SectionGUID;
      obj.Type = lookup[obj[parentAttr]][childrenAttr][index].Type;
      obj.BtnContent = lookup[obj[parentAttr]][childrenAttr][index].BtnContent;
      obj.AdBtnColor = lookup[obj[parentAttr]][childrenAttr][index].AdBtnColor;
      obj.AdBtnImg = lookup[obj[parentAttr]][childrenAttr][index].AdBtnImg;
      obj.AdBtnHeight = lookup[obj[parentAttr]][childrenAttr][index].Height;
      obj.AdBtnWidth = lookup[obj[parentAttr]][childrenAttr][index].Width;
      obj.AdBtnImgOpacityColor = lookup[obj[parentAttr]][childrenAttr][index].AdBtnImgOpacityColor;
      obj.AdBtnImgOpacity = lookup[obj[parentAttr]][childrenAttr][index].AdBtnImgOpacity;
      obj.AdBtnBgColor = lookup[obj[parentAttr]][childrenAttr][index].AdBtnBgColor;
      lookup[obj[parentAttr]][childrenAttr].splice(index, 1);
      lookup[obj[parentAttr]][childrenAttr].splice(index, 0, obj);
    } else {
      treeList.push(obj);
    }
  });
  return treeList;
};

const __find_index_of_sections = (sections, page) => {
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].ConnectedPageGUID == page.PageGUID) {
      return i;
    }
  }
  return 0;
};