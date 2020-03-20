const userFlag = 'SHENNONG-CURRENT-USER';

export function saveCurrentUser(userString) {
  localStorage.setItem(userFlag, userString);
}

export function currentUser() {
  return JSON.parse(localStorage.getItem(userFlag));
}

export function currentUserId() {
  return JSON.parse(localStorage.getItem(userFlag)).userId;
}

export function clearCurrentUser() {
  localStorage.removeItem(userFlag);
}
