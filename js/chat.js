// ================= GLOBAL =================
let currentChatId = null;
let currentUser = null;

// ================= AUTH =================
auth.onAuthStateChanged(user => {
  if(user){
    currentUser = user;
  }
});

// ================= START CHAT =================
async function startChat(itemId, ownerId){

  const user = auth.currentUser;

  if(!user){
    alert("Login required");
    return;
  }

  // 🔥 DEBUG (optional - helps you check)
  console.log("Current User:", user.uid);
  console.log("Owner ID:", ownerId);

  // ❌ prevent chatting with yourself
  // ✅ UPDATED MESSAGE (clear explanation)
  if(user.uid === ownerId){
    alert("This is your item. Ask another user to contact you.");
    return;
  }

  // 🔥 check if chat already exists
  const existing = await db.collection("chats")
  .where("itemId","==",itemId)
  .where("users","array-contains",user.uid)
  .get();

  let chatId;

  if(!existing.empty){
    chatId = existing.docs[0].id;
  }else{

    // ✅ create new chat
    const chatRef = await db.collection("chats").add({
      itemId: itemId,
      users: [user.uid, ownerId],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      blocked: false // ✅ ADDED (important for safety)
    });

    chatId = chatRef.id;
  }

  // 🔥 load chat
  loadChat(chatId);

}

// ================= LOAD CHAT =================
function loadChat(chatId){

  currentChatId = chatId;

  const chatBox = document.getElementById("chatBox");

  if(!chatBox){
    console.error("chatBox element not found!");
    return;
  }

  chatBox.innerHTML = "";

  // 🔥 realtime messages
  db.collection("chats")
  .doc(chatId)
  .collection("messages")
  .orderBy("createdAt")
  .onSnapshot(snapshot=>{

    chatBox.innerHTML = "";

    snapshot.forEach(doc=>{

      const msg = doc.data();

      const isMe = msg.senderId === currentUser.uid;

      chatBox.innerHTML += `

      <div style="
      text-align:${isMe ? "right":"left"};
      margin-bottom:8px;
      ">

      <span style="
      display:inline-block;
      padding:8px 12px;
      border-radius:10px;
      background:${isMe ? "#007bff":"#e4e6eb"};
      color:${isMe ? "white":"black"};
      max-width:70%;
      word-wrap:break-word;
      ">
      ${msg.text}
      </span>

      </div>

      `;

    });

    // ✅ auto scroll
    chatBox.scrollTop = chatBox.scrollHeight;

  });

}

// ================= SEND MESSAGE =================
async function sendMessage(){

  const input = document.getElementById("messageInput");

  if(!input){
    console.error("messageInput not found!");
    return;
  }

  const text = input.value.trim();

  if(!text || !currentChatId) return;

  // 🔥 check if blocked
  const blocked = await isBlocked(currentChatId);
  if(blocked){
    alert("You cannot send messages in this chat.");
    return;
  }

  // 🔥 send message
  await db.collection("chats")
  .doc(currentChatId)
  .collection("messages")
  .add({
    text: text,
    senderId: currentUser.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  input.value = "";

}

// ================= BLOCK SYSTEM =================
async function blockUser(chatId){

  const chatDoc = await db.collection("chats").doc(chatId).get();

  if(!chatDoc.exists) return;

  // 🔥 block entire chat
  await db.collection("chats").doc(chatId).update({
    blocked: true
  });

  alert("User blocked successfully");

}

// ================= CHECK BLOCK =================
async function isBlocked(chatId){

  const doc = await db.collection("chats").doc(chatId).get();

  if(!doc.exists) return false;

  return doc.data().blocked === true;

}

// ================= REPORT USER =================
async function reportUser(chatId, reason){

  if(!reason){
    alert("Please provide a reason");
    return;
  }

  await db.collection("reports").add({
    chatId: chatId,
    reportedBy: currentUser.uid,
    reason: reason,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  alert("User reported. Admin will review.");

}