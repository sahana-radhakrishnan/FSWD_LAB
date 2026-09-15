let count = 0;

function addCart() {
  count++;
  document.getElementById("cart").innerText = count;
}

function orderMsg() {
  alert("Your order has been placed successfully!");
  return false;
}