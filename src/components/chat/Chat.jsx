import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "../../lib/firebase"; // No changes here
import { useChatStore } from "../../lib/chatStore"; // No changes here
import { useUserStore } from "../../lib/userStore"; // No changes here
import upload from "../../lib/upload"; // Assuming this is the upload function for images

const Chat = () => {
    const [chat, setChat] = useState(null);
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [img, setImg] = useState({ file: null, url: "" });
    const { currentUser } = useUserStore();
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const endRef = useRef(null);
    const emojiRef = useRef(null);

    // Scroll to the latest message
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    // Fetch messages for the current chat
    useEffect(() => {
        const selectedChatId = localStorage.getItem('selectedChatId');
        const idToFetch = chatId || selectedChatId;

        if (!idToFetch) return;

        const unSub = onSnapshot(doc(db, "chats", idToFetch), (res) => {
            const data = res.data();
            if (data) {
                setChat(data);
            }
        });

        return () => {
            unSub();
        };
    }, [chatId]);

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
        setOpen(false);
    };

    const handleImg = (e) => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            });
        }
    };

    const handleSend = async () => {
        if (text.trim() === "" && !img.file) return;

        let imgUrl = null;
        try {
            if (img.file) {
                imgUrl = await upload(img.file);
            }
            const chatDocRef = doc(db, "chats", chatId);
            const messageId = new Date().getTime(); // Ensure it's unique

            await updateDoc(chatDocRef, {
                messages: arrayUnion({
                    id: messageId,
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    ...(imgUrl && { img: imgUrl }),
                }),
            });

            const userIDs = [currentUser.id, user.id];
            await Promise.all(userIDs.map(async (id) => {
                const userChatsRef = doc(db, "usersChats", id);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();
                    const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);

                    userChatsData.chats[chatIndex].lastMessage = text;
                    userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
                    userChatsData.chats[chatIndex].updatedAt = Date.now();

                    await updateDoc(userChatsRef, {
                        chats: userChatsData.chats,
                    });
                }
            }));

            setText(""); // Clear the input field after sending
            setImg({ file: null, url: "" }); // Reset image state
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const handleClickOutside = (event) => {
        if (emojiRef.current && !emojiRef.current.contains(event.target)) {
            setOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className='chat'>
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt="" />
                    <div className="texts">
                        <span>{user?.username || "Unknown User"}</span>
                        <p>Lorem ipsum dolor.</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="" />
                    <img src="./video.png" alt="" />
                    <img src="./info.png" alt="" />
                </div>
            </div>
            <div className="center">
                {chat?.messages?.map((message) => (
                    <div className={message.senderId === currentUser.id ? "message own" : "message"} key={message.id || message.createdAt}>
                        <div className="texts">
                            {message.img && <img src={message.img} alt="sent" />}
                            <p>{message.text}</p>
                            <span>{new Date(message.createdAt.seconds * 1000).toLocaleTimeString()}</span>
                        </div>
                    </div>
                ))}
                {img.url && (
                    <div className="message own">
                        <div className="texts">
                            <img src={img.url} alt="" />
                        </div>
                    </div>
                )}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                        <img src="./img.png" alt="" />
                    </label>
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
                    <img src="./camera.png" alt="" />
                    <img src="./mic.png" alt="" />
                </div>
                <input
                    type="text"
                    placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You cannot send a Message!" : "Type a message..."}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                />
                <div className="emoji" ref={emojiRef}>
                    <img src="./emoji.png" alt="" onClick={() => setOpen(prev => !prev)} />
                    {open && (
                        <div className="picker">
                            <EmojiPicker onEmojiClick={handleEmoji} />
                        </div>
                    )}
                </div>
                <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
            </div>
        </div>
    );
};

export default Chat;
