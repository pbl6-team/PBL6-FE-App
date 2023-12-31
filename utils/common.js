export function header({ title }) {
  return {
    headerTitle: title,
    headerShown: true,
  };
}

export function checkCorrectPassword(password) {
  let state = {
    correct: false,
    error: "",
  };
  state = checkCorrectInput(password, "Password");
  if (state.correct == false) return state;

  if (password.length < 4) {
    state.error = "Password must be at least 4 characters";
    state.correct = false;
    return state;
  }

  if (validatePassword(password) == false) {
    state.correct = false;
    state.error =
      "Password must contain at least 1 uppercase, 1 digit, 1 special symbol";
    return state;
  }

  if (state.error == "") state.correct = true;
  return state;
}

export function checkCorrectUsername(username) {
  let state = {
    correct: false,
    error: "",
  };
  state = checkCorrectInput(username, "Username");
  return state;
}

export function checkCorrectEmail(email) {
  let state = {
    correct: false,
    error: "",
  };
  state = checkCorrectInput(email, "Email");
  if (state.correct == false) return state;

  if (validateEmail(email) == false) {
    state.correct = false;
    state.error = "Email incorrect format";
    return state;
  }
  if (state.error == "") state.correct = true;

  return state;
}

const hasWhiteSpace = (s) => {
  return s.indexOf(" ") >= 0;
};

function checkCorrectInput(inputText, typeInput) {
  let state = {
    correct: false,
    error: "",
  };
  if (inputText == "" || inputText == null) {
    state.error = typeInput + " is empty";
    return state;
  }
  if (hasWhiteSpace(inputText)) {
    state.error = typeInput + " has white space";
    return state;
  }

  if (state.error == "") state.correct = true;

  return state;
}

function validatePassword(password) {
  return (
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function validateEmail(email) {
  let format = /\S+@\S+\.\S+/;
  return format.test(email);
}

export function compareSendAt(msg1, msg2) {
  if (msg1.sendAt > msg2.sendAt) return -1;
  if (msg1.sendAt < msg2.sendAt) return 1;
  return 0;
}

export function getShortTime(sendAt) {
  try {
    let time = new Date(sendAt);
    const timeFormat = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    return timeFormat;
  } catch {
    return "";
  }
}

export function getShortDatetime(sendAt) {
  try {
    let time = new Date(sendAt);
    const timeFormat = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    let dayFormat = time.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
      .split('/').reverse().join('/');
    dayFormat = dayFormat + "/" + time.getFullYear();
    return dayFormat + " " + timeFormat;
  } catch {
    return "";
  }
}

export function getShortDatetimeSendAt(sendAt) {
  try {
    let time = new Date(sendAt);
    const timeFormat = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    let dayFormat = time.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
      .split('/').reverse().join('/');
    if (!checkIsThisYear(time)) dayFormat = dayFormat + "/" + time.getFullYear();
    if (checkIsToday(time))
      return timeFormat;
    return dayFormat + " " + timeFormat;
  } catch {
    return "";
  }
}

export function getShortDate(date) {
  try {
    let time = new Date(date);
    let dayFormat = time.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
      .split('/').reverse().join('/');
    dayFormat = dayFormat + "/" + time.getFullYear();
    if (dayFormat.includes("Invalid")) return "";
    return dayFormat;
  } catch {
    return "";
  }
}
function checkIsToday(time) {
  try {
    const now = new Date();
    if (now.getDay() == time.getDay() &&
      now.getMonth() == time.getMonth() &&
      now.getFullYear() == time.getFullYear()) return true;
    return false;
  } catch {
    return false;
  }
}

function checkIsThisYear(time) {
  try {
    const now = new Date();
    if (now.getFullYear() == time.getFullYear())
      return true;
    return false;

  } catch {
    return false;
  }
}




export const emojis = [{
  key: 128405,
  code: 128405,
}];
for (i = 128147; i <= 128150; i++) {
  emojis.push({
    key: i,
    code: i,
  });
}
for (i = 128077; i <= 128080; i++) {
  emojis.push({
    key: i,
    code: i,
  });
}
for (i = 128512; i <= 128530; i++) {
  emojis.push({
    key: i,
    code: i,
  });
}


export const successStatusCodes = ["200", "201", "202", "203", "204"];

export function truncString(str) {
  const LIMIT = 35;
  try {
    if (str.length > LIMIT) return str.slice(0, LIMIT) + "...";
    return str;

  } catch {
    return str;
  }
}

export function truncChannelName(str, LIMIT) {
  try {
    if (str.length > LIMIT) return str.slice(0, LIMIT) + "...";
    return str;

  } catch {
    return str;
  }
}



export function getIconChannel(category) {
  if (category == "4") return "video-outline";
  return "pound";
}

export function validatePhoneNumber(phoneNumber) {
  var phoneRegex = /^\d{6,}$/;

  if (phoneRegex.test(phoneNumber)) {
    return true;
  } else {
    return false;
  }
}

export function getShorterFileName(fileName) {
  try {
    const LIMIT = 20;
    const split = fileName.split(".");
    let name = split[0];
    let extension = split[1];
    if (name.length > LIMIT) {
      return name.slice(0, LIMIT) + "..." + extension;
    }
    return fileName;
  } catch {
    return fileName;
  }
}

export function checkDateRange(date, timeStart, timeEnd) {
  const dateObject = new Date(date);
  const startObject = new Date(timeStart);
  const endObject = new Date(timeEnd);

  if (dateObject < startObject) {
    return -1;
  } else if (dateObject >= startObject && dateObject <= endObject) {
    return 0;
  } else {
    return 1;
  }
}

export const MEETING_STATUS = ["Scheduled", "Happening", "Ended", "Canceled"];
export const MEETING_COLOR = ["#699AD1", "green", "red", "red"];


