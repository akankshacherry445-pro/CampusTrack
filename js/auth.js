// REGISTER
function register() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please fill all fields.");
    return;
  }

  if (!email.endsWith("@mlrit.ac.in")) {
    alert("Use your campus email only!");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  // ✅ FORCE STUDENT ROLE
  const role = "student";

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      return db.collection("users").doc(user.uid).set({
        email: email,
        role: role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert("Registered successfully!");
      window.location.href = "login.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}


// LOGIN
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email.endsWith("@mlrit.ac.in")) {
    alert("Use your campus email only!");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(async (userCredential) => {

      const uid = userCredential.user.uid;
      const doc = await db.collection("users").doc(uid).get();

      if (!doc.exists) {
        alert("User role not found.");
        return;
      }

      const role = doc.data().role;

      if (role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "dashboard.html";
      }
    })
    .catch((error) => {
      alert(error.message);
    });
}