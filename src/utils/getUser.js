export default function getUser() {
  let userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
  let email = localStorage.getItem("email");

  if (!userId) {
    userId = `guest-${Math.floor(Math.random() * 100000)}`;
    sessionStorage.setItem("userId", userId); // guest IDs only go in sessionStorage
  }

  const isGuest = !email;
  const username = isGuest ? null : email;

  return { id: userId, username, isGuest };
}