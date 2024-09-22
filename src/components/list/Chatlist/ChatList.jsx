import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useUserStore } from "../../../lib/userStore";
import AddUser from "./addUser/AddUser";
import "./chatlist.css";
import { useEffect, useState, useMemo } from "react";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState(""); // For search input

  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.id) return;

    const userChatsRef = doc(db, "usersChats", currentUser.id);

    const unSub = onSnapshot(userChatsRef, async (res) => {
      const docData = res.data();
      if (!docData) return;

      const items = docData.chats || [];

      const uniqueChatsMap = new Map();

      const promises = items.map(async (item) => {
        if (item.receiverId === currentUser.id) return;

        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);
        const user = userDocSnap.data();

        if (!uniqueChatsMap.has(item.receiverId)) {
          uniqueChatsMap.set(item.receiverId, { ...item, user });
        }
      });

      await Promise.all(promises);
      const uniqueChats = Array.from(uniqueChatsMap.values());
      setChats(uniqueChats);
    });

    return () => {
      unSub();
    };
  }, [currentUser?.id]);

  const sortedChats = useMemo(() => {
    return chats.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [chats]);

  const filteredChats = useMemo(() => {
    return sortedChats.filter((chat) =>
      chat.user.username.toLowerCase().includes(input.toLowerCase())
    );
  }, [input, sortedChats]);

  const handleSelect = async (chat) => {
    const updatedChats = chats.map((item) => {
      if (item.chatId === chat.chatId) {
        return { ...item, isSeen: true };
      }
      return item;
    });

    const userChatsRef = doc(db, "usersChats", currentUser.id);
    try {
      await updateDoc(userChatsRef, {
        chats: updatedChats,
      });
      changeChat(chat.chatId, chat.user);
      // Store the selected chat ID in local storage
      localStorage.setItem('selectedChatId', chat.chatId);
    } catch (err) {
      console.error("Error updating chat status:", err);
    }
  };

  return (
    <div className="chatlist">
      <div className="search">
        <div className="searchbar">
          <img src="/search.png" alt="Search Icon" />
          <input
            type="text"
            placeholder="Search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt="Add User"
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          className="items"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img src={chat.user.avatar || "./avatar.png"} alt="Avatar" />
          <div className="texts">
            <span>{chat.user.username}</span>
            <p>{chat.lastMessage || "No messages yet"}</p>
          </div>
        </div>
      ))}
      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
