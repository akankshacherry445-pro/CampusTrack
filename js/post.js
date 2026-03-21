// post.js

const postForm = document.getElementById("postForm");

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const itemName = document.getElementById("itemName").value;
  const category = document.getElementById("category").value;
  const location = document.getElementById("location").value;
  const description = document.getElementById("description").value;
  const imageFile = document.getElementById("image").files[0];

  const user = firebase.auth().currentUser;

  if (!user) {
    alert("You must login first.");
    return;
  }

  try {

    let imageUrl = "";

    // Upload image if user selected one
    if (imageFile) {

      const storageRef = firebase.storage().ref();
      const fileRef = storageRef.child("lostItems/" + Date.now() + "_" + imageFile.name);

      await fileRef.put(imageFile);

      imageUrl = await fileRef.getDownloadURL();
    }

    // Save report to Firestore
    await db.collection("lostItems").add({
      itemName: itemName,
      category: category,
      location: location,
      description: description,
      imageUrl: imageUrl,
      userEmail: user.email,
      status: "Pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Report submitted successfully!");

    postForm.reset();

  } catch (error) {
    console.error("Error:", error);
    alert("Error submitting report");
  }
});