/**
 * TODO(cazden) Logout function that removes token from storage and redirects.
 */
export const logout = () => {
  localStorage.removeItem("token")
  sessionStorage.removeItem("token")
  window.location.href = "/"
}
