import { auth, db } from "../../lib/firebase";
import { signOut } from "firebase/auth";

import "./detail.css";
import { useUserStore } from "../../lib/userStore";
import { useChatStore } from "../../lib/chatStore.js";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore(); // Added blocking state
  const { currentUser } = useUserStore(); // Added user store

  const handleBlock = async () => {
      if (!user) return;

      const userDocRef = doc(db, "users", currentUser.id);
      try {
          await updateDoc(userDocRef, {
              blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
          });
          changeBlock(); // Call function to update block state
      } catch (err) {
          console.log(err);
      }
  };

  const handleLogout = async () => {
      try {
          await auth.signOut(); // Changed signOut method to use auth from first code
      } catch (error) {
          console.error("Error signing out: ", error);
      }
  };

  return (
      <div className="detail">
          <div className="user">
              <img src={user?.avatar || "./avatar.png"} alt="" />
              <h2>{user?.username || "Unknown User"}</h2> {/* Dynamic username */}
              <p>Lorem ipsum dolor sit amet.</p>
          </div>
          <div className="info">
              <div className="option">
                  <div className="title">
                      <span>Chat Settings</span>
                      <img src="./arrowUp.png" alt="" />
                  </div>
              </div>
              <div className="option">
                  <div className="title">
                      <span>Privacy & Help</span>
                      <img src="./arrowUp.png" alt="" />
                  </div>
              </div>
              <div className="option">
                  <div className="title">
                      <span>Shared Photos</span>
                      <img src="./arrowDown.png" alt="" />
                  </div>
                  <div className="photos">
                      {/* Placeholder photos for shared photos */}
                      <div className="photoItem">
                          <div className="photoDetail">
                              <img src="https://i.pinimg.com/736x/a4/6b/ba/a46bba75ea009158ac114b218ca11640.jpg" alt="" />
                              <span>photo_2024_2.png</span>
                          </div>
                          <img src="./download.png" className="icon" alt="" />
                      </div>
                      {/* Repeat for other photos as needed */}
                  </div>
              </div>
              <div className="option">
                  <div className="title">
                      <span>Shared Files</span>
                      <img src="./arrowUp.png" alt="" />
                  </div>
              </div>
              <button onClick={handleBlock}>
                  {isCurrentUserBlocked ? "You are Blocked!" : isReceiverBlocked ? "User blocked" : "Block User"}
              </button>
              <button className="logout" onClick={handleLogout}>Logout</button>
          </div>
      </div>
  );
};

export default Detail;