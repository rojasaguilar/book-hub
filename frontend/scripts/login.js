const formularioLogin = document.getElementById("form-login");
formularioLogin.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = {
    nombreUsuario: formularioLogin.nombreUsuario.value,
    password: formularioLogin.password.value,
  };

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
  if(data){
    localStorage.setItem('user',JSON.stringify(data));
    window.location.href='/home'
  }
    })
    .catch((err) => console.error(err,"hubo error"));
});
