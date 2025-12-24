import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import emailjs from "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js";

// Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCY2ZeJ4jJu-vPo_25ZNa1-pPeuVFxi9Ag",
  authDomain: "safar-1a4f5.firebaseapp.com",
  projectId: "safar-1a4f5"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const customersCol = collection(db,"customers");

// Check login
onAuthStateChanged(auth,user=>{
  if(!user) window.location="login.html";
});

// Customer CRUD
window.addCustomer = async () => {
  const name=document.getElementById("name").value;
  const email=document.getElementById("email").value;
  const whatsapp=document.getElementById("whatsapp").value;
  if(!name||!email||!whatsapp){ alert("Fill all fields"); return; }
  await addDoc(customersCol,{name,email,whatsapp,createdAt:serverTimestamp()});
  loadCustomers(); updateStats();
};

export async function loadCustomers(){
  const snapshot = await getDocs(customersCol);
  const table=document.getElementById("customersTable"); table.innerHTML="";
  snapshot.forEach(docSnap=>{
    const c=docSnap.data();
    table.innerHTML+=`<tr>
      <td>${c.name}</td>
      <td>${c.email}</td>
      <td>${c.whatsapp}</td>
      <td><button onclick="deleteCustomer('${docSnap.id}')">Delete</button></td>
    </tr>`;
  });
}
window.deleteCustomer = async (id)=>{
  await deleteDoc(doc(db,"customers",id));
  loadCustomers(); updateStats();
};
window.updateStats = async ()=>{
  const snapshot = await getDocs(customersCol);
  document.getElementById("totalCustomers").innerText = snapshot.size;
};
loadCustomers(); updateStats();

// EmailJS
emailjs.init("kpOeovejkjSL4ehak");
window.sendBulkEmail = async ()=>{
  const subject=document.getElementById("emailSubject").value;
  const message=document.getElementById("emailMessage").value;
  if(!subject||!message){ alert("Enter subject & message"); return; }
  const snapshot = await getDocs(customersCol);
  for(const docSnap of snapshot.docs){
    const c=docSnap.data();
    await emailjs.send("SERVICE_ID","TEMPLATE_ID",{to_email:c.email,subject,message});
  }
  alert("All Emails Sent"); document.getElementById("totalEmails").innerText = snapshot.size;
};

// WhatsApp call
window.sendBulkWhatsApp = async ()=>{
  const message=document.getElementById("waMessage").value;
  if(!message){ alert("Enter WhatsApp message"); return; }
  const snapshot = await getDocs(customersCol);
  for(const docSnap of snapshot.docs){
    const c=docSnap.data();
    await fetch("YOUR_FUNCTION_URL/sendWhatsApp",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({number:c.whatsapp,message})
    });
  }
  alert("All WhatsApp messages sent");
  document.getElementById("totalWA").innerText = snapshot.size;
};
