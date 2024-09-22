import List from "./components/list/List";
import Detail from "./components/detail/Detail";
import Chat from "./components/chat/Chat";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useChatStore } from "./lib/chatStore";

const App = () => {
    const { currentUser, isLoading, fetchUserInfo } = useUserStore();
    const { chatId } = useChatStore();

    useEffect(() => {
        const unSub = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchUserInfo(user.uid);
            } else {
                // User is not logged in, set state accordingly
                fetchUserInfo(null);
            }
        });

        return () => {
            unSub();
        };
    }, [fetchUserInfo]);

    // If data is still loading
    if (isLoading) return <div className="loading">Loading...</div>;

    return (
        <div className='container'>
            {currentUser ? (
                <>
                    <List />
                    {chatId && <Chat />}
                    {chatId && <Detail />}
                </>
            ) : (
                <Login />
            )}
            <Notification />
            <ToastContainer />
        </div>
    );
}

export default App;
