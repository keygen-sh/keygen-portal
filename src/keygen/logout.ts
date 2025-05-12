/**
 * Logout function that removes token from storage and redirects.
 * (Cazden) To be expanded upon later.
 */
export const logout = () => {
  localStorage.removeItem("token")
  sessionStorage.removeItem("token")
  window.location.href = "/"
}
