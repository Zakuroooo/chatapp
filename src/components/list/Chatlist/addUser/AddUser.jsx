import { useState } from "react";
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import "./addUser.css";
import { useUserStore } from "../../../../lib/userStore";
import { db } from "../../../../lib/firebase";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const username = formData.get("username").trim();

    if (!username) {
      setError("Username cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      } else {
        setUser(null);
        setError("No matching user found.");
      }
    } catch (err) {
      setError("An error occurred while searching for the user.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!user) {
      setError("No user to add.");
      return;
    }

    setLoading(true);
    setError(null);

    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "usersChats"); // Changed here

    try {
      // Create a new chat document
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const chatData = {
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: user.id,
        updatedAt: Date.now(),
      };

      // Create or update the current user's chat document
      const currentUserDocRef = doc(userChatsRef, currentUser.id);
      const currentUserSnapshot = await getDoc(currentUserDocRef);

      if (currentUserSnapshot.exists()) {
        // Update existing user's chats
        await updateDoc(currentUserDocRef, {
          chats: arrayUnion({
            ...chatData,
            receiverId: user.id,
          }),
        });
      } else {
        // Create new user document with the chat data
        await setDoc(currentUserDocRef, {
          chats: [chatData],
        });
      }

      // Create or update the other user's chat document
      const userDocRef = doc(userChatsRef, user.id);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        // Update existing user's chats
        await updateDoc(userDocRef, {
          chats: arrayUnion({
            ...chatData,
            receiverId: currentUser.id,
          }),
        });
      } else {
        // Create new user document with the chat data
        await setDoc(userDocRef, {
          chats: [{
            ...chatData,
            receiverId: currentUser.id,
          }],
        });
      }

      console.log("Chat added successfully");
    } catch (err) {
      setError("An error occurred while adding the user.");
      console.error("Error adding user:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button type="submit" disabled={loading}>Search</button>
      </form>
      {error && <div className="error">{error}</div>}
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd} disabled={loading}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
