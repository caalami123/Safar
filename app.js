import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-functions.js";

// Firebase config
const firebaseConfig = { 
  apiKey: "AIzaSyCY2ZeJ4jJu-vPo_25ZNa1-pPeuVFxi9Ag",
  authDomain: "safar-1a4f5.firebaseapp.com",
  projectId: "safar-1a4f5",
  storageBucket: "safar-1a4f5.firebasestorage.app",
  messagingSenderId: "452916843428",
  appId: "1:452916843428:web:ee027d2e3335fc98f8e731",
  measurementId: "G-81DCXQY1LQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions();
const customersCol = collection(db, "customers");

// Callable function (Cloud Function) for sending email
const sendEmailCampaign = httpsCallable(functions, 'sendEmailCampaign');

// -------------------- Toast --------------------
function showToast(message,type='success'){
  const toast=document.getElementById('toast');
  const toastMessage=document.getElementById('toastMessage');
  const toastIcon=toast.querySelector('.toast-icon i');
  toastMessage.textContent=message;
  toastIcon.className=(type==='success')?'fas fa-check':
                      (type==='error')?'fas fa-exclamation-triangle':'fas fa-info-circle';
  toast.style.borderLeftColor=(type==='success')?'#4cc9f0':(type==='error')?'#f94144':'#4361ee';
  toast.classList.add('show');
  setTimeout(()=>{toast.classList.remove('show');},3000);
}

// -------------------- Login / Logout --------------------
async function login(){
  const email=document.getElementById('adminUser').value;
  const password=document.getElementById('adminPass').value;
  if(!email || !password){showToast('Enter email & password','error');return;}
  try{
    const userCred=await signInWithEmailAndPassword(auth,email,password);
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.remove('hidden');
    showToast(`Welcome, ${userCred.user.email.split('@')[0]}`);
    loadCustomers();
  }catch(err){console.error(err);showToast('Invalid credentials','error');}
}

async function logout(){
  await signOut(auth);
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('dashboardPage').classList.add('hidden');
  showToast('Logged out successfully');
}

// -------------------- Customers --------------------
async function addCustomer(){
  const name=document.getElementById('name').value;
  const email=document.getElementById('email').value;
  const whatsapp=document.getElementById('whatsapp').value;
  if(!name||!email||!whatsapp){showToast('Fill all fields','error');return;}
  await addDoc(customersCol,{name,email,whatsapp,createdAt:new Date()});
  document.getElementById('name').value='';
  document.getElementById('email').value='';
  document.getElementById('whatsapp').value='';
  loadCustomers();
}

async function loadCustomers(){
  const snapshot=await getDocs(query(customersCol,orderBy('createdAt','desc')));
  const table=document.getElementById('customersTable');
  table.innerHTML='';
  if(snapshot.empty){table.innerHTML='<tr><td colspan="4">No customers</td></tr>';return;}
  snapshot.forEach(docu=>{
    const c=docu.data();
    table.innerHTML+=`<tr>
      <td>${c.name}</td>
      <td>${c.email}</td>
      <td>${c.whatsapp}</td>
      <td><button onclick="deleteCustomer('${docu.id}')">Delete</button></td>
    </tr>`;
  });
}

window.deleteCustomer=async function(id){
  if(!confirm('Delete this customer?'))return;
  await deleteDoc(doc(db,'customers',id));
  showToast('Customer deleted');
  loadCustomers();
}

// -------------------- Email Campaign --------------------
window.sendCampaign=async function(){
  const subject=document.getElementById('campaignSubject').value;
  const message=document.getElementById('campaignMessage').value;
  if(!subject||!message){showToast('Fill subject & message','error');return;}
  const snapshot=await getDocs(customersCol);
  for(const docu of snapshot.docs){
    const c=docu.data();
    await sendEmailCampaign({to:c.email,subject,message});
  }
  showToast(`Email sent to ${snapshot.size} customers`);
}

// -------------------- Tabs --------------------
window.showTab=function(tabID){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(tabID).classList.add('active');
};
