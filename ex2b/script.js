let cart = 0;

function buy() {
  cart++;
  document.getElementById("cart").innerText = cart;
  alert("Product added to cart!");
}

function sellProduct() {
  alert("Product listed successfully!");
  return false;
}