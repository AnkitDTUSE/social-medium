document.getElementById("inputButt").addEventListener("click", (event) => {
  event.preventDefault();
  document.getElementById("inputField").click();
});

document.getElementById("inputField").addEventListener("change", (event) => {
  if (event.target.files.length > 0) document.getElementById("myForm").submit();
});
