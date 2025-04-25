// src/utils/getUser.js
export function getUser() {
    let userId = localStorage.getItem("userId");
    let username = localStorage.getItem("username");
  
    if (!userId) {
      if (!localStorage.getItem("guestId")) {
        const guestId = `guest-${Math.floor(Math.random() * 100000)}`;
        localStorage.setItem("guestId", guestId);
      }
  
      userId = localStorage.getItem("guestId");
      if (!username) {
        const guestName = `Guest ${Math.floor(Math.random() * 1000)}`;
        localStorage.setItem("username", guestName);
        username = guestName;
      }
    }
  
    return { userId, username };
  }