//modales
const button = document.getElementById("signup");
button.addEventListener("click", () => {
  document.getElementById("form-container").style.visibility = "visible";
  document.getElementById("main").style.backgroundColor = " rgba(0, 0, 0, 0.8)";
  document.getElementById("main").style.filter = "brightness(40%)";
});

document.getElementById("main").addEventListener("click", (e) => {
  if (e.target === main) {
    document.getElementById("form-container").style.visibility = "hidden";
    document.getElementById("login-container").style.visibility = "hidden";
    document.getElementById("main").style.backgroundColor = " rgba(0, 0, 0, 0)";
    document.getElementById("main").style.filter = "brightness(100%)";
  }
});

const btn_login = document.getElementById("login");
btn_login.addEventListener("click", (e) => {
  document.getElementById("login-container").style.visibility = "visible";
  document.getElementById("main").style.backgroundColor = " rgba(0, 0, 0, 0.8)";
  document.getElementById("main").style.filter = "brightness(40%)";
});

//signup
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
      document.getElementById("form-container").style.visibility = "hidden";
      document.getElementById("login-container").style.visibility = "visible";
      return;
    }
  }
});

//login
const formularioLogin = document.getElementById("form-login");
formularioLogin.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = {
    nombreUsuario: formularioLogin.nombreUsuario.value,
    password: formularioLogin.password.value,
  };

  try {
    await login(data);
  } catch (error) {
    alert(error);
  }
});

const login = async (data) => {
  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log(errorData.error);
    const message = errorData.error || "x";
    throw new Error(message);
  }
  window.location.href = "/home";
};
