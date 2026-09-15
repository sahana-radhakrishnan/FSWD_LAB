function like(id) {
  let x = document.getElementById("like" + id);
  x.innerText = Number(x.innerText) + 1;
}