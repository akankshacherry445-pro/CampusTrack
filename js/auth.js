// ================= REGISTER =================
function register() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const roleElement = document.getElementById("role");
  const role = roleElement ? roleElement.value : "student";

  // ✅ validations
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

  // 🔥 create user
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // ✅ store role in Firestore
      return db.collection("users").doc(user.uid).set({
        email: email,
        role: role,
        verified: true,
        createdAt: new Date()
      });
    })
    .then(() => {
      alert("Registered successfully!");
      window.location.href = "login.html";
    })
    .catch((error) => {
      alert(error.message);
      console.error(error);
    });
}


// ================= LOGIN =================
// LOGIN
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  auth.signInWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      const uid = userCredential.user.uid;

      const doc = await db.collection("users").doc(uid).get();

      if (!doc.exists) {
        alert("User role not found.");
        return;
      }

      const role = doc.data().role;

      // ✅ IMPORTANT — file names must match
      if (role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "dashboard.html"; // ← your student page
      }
    })
    .catch((error) => {
      alert(error.message);
      console.error(error);
    });
}