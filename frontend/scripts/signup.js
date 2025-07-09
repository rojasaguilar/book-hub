const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (formulario.password.value !== formulario.password2.value) {
    alert("Contraseñas no coinciden");
    return;
  } else {
    let data = {
      email: formulario.email.value,
      nombreUsuario: formulario.nombreUsuario.value,
      password: formulario.password.value,
    };

    const response = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application:json" },
      body: JSON.stringify(data),
    });
    if (response.status === 200) {
      alert("usuario registrado correctamente");
    }
  }
});
