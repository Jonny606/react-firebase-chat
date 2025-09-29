import React, { useRef, useState } from 'react';
import './App.css';

// --- NEW Firebase v9 Modular Imports ---
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics'; 
// Note: We need getAnalytics, but it's not used in this example yet.

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// --- Firebase Initialization (v9 style) ---
// IMPORTANT: You must replace the placeholder with your actual Firebase config object.
const firebaseConfig = {
  // your config goes here, like:
  // apiKey: "...",
  // authDomain: "...",
  // projectId: "...",
  // etc.
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const analytics = getAnalytics(app); // Initialized but not currently used in components

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {
  // We use the imported GoogleAuthProvider
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    // We use the modular signInWithPopup
    signInWithPopup(auth, provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )
}

function SignOut() {
  // The sign-out function remains the same
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  
  // V9: Use collection() to get a reference to the 'messages' collection
  const messagesRef = collection(firestore, 'messages'); 
  
  // V9: Use query() to combine the collection reference and the constraints
  const q = query(messagesRef, orderBy('createdAt'), limit(25));

  // useCollectionData now uses the v9 Query object (q)
  const [messages] = useCollectionData(q, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    // V9: Use addDoc() instead of .add() on the collection reference
    await addDoc(messagesRef, {
      text: formValue,
      // V9: serverTimestamp() is imported and used directly
      createdAt: serverTimestamp(), 
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="user avatar" />
      <p>{text}</p>
    </div>
  </>)
}


export default App;
