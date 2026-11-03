
if (localStorage.getItem("isDeveloper") == null) {
    localStorage.setItem("isDeveloper", "false");
}
document.addEventListener("contextmenu", (event) => {
    if (localStorage.getItem("isDeveloper") == "false") {
      event.preventDefault();
    }
});
document.addEventListener("keydown", (event) => {
    if (event.key == "F12") {
      if (localStorage.getItem("isDeveloper") == "false") {
        event.preventDefault();
      }
    }
});
