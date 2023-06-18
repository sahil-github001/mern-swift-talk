import axios from "axios";
import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../context/UserContext";
import { uniqBy } from "lodash";
import { Helmet } from "react-helmet";
import Sidebar from "../components/Sidebar";
import ChatInputBar from "../components/ChatInputBar";
import Loader from "../components/Loader";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUsername, setSelectedUserUsername] = useState(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const divUnderMessages = useRef();
  const { id, setId, setUsername } = useContext(UserContext);

  useEffect(() => {
    connectToWs();
  }, [selectedUserId]);

  const connectToWs = () => {
    const ws = new WebSocket("ws://localhost:4000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected, Trying to reconnect");
        connectToWs();
      }, 1000);
    });
  };

  const showOnlinePeople = (peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  };

  const handleMessage = (ev) => {
    const messageData = JSON.parse(ev.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      if (messageData.sender === selectedUserId) {
        setMessages((prev) => [...prev, { ...messageData }]);
      }
    }
  };

  const handleLogoutConfirmed = () => {
    axios.post("/auth/logout").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
    setShowLogoutConfirmation(false);
  };

  const handleLogoutCancelled = () => {
    setShowLogoutConfirmation(false);
  };

  useEffect(() => {
    /* divUnderMessages is a reference to a DOM element, and current is a property or method that retrieves
    he current value of that element */
    const div = divUnderMessages.current;
    div.scrollIntoView({ behaviour: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get("/messages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  /* This method accepts iteratee which is invoked for each element in array to generate the criterion by which 
  uniqueness is computed. The order of result values is determined by the order they occur in the array. 
  The iteratee is invoked with one argument: */
  const messagesWithoutDupes = uniqBy(messages, "_id");

  return (
    <>
      <Helmet>
        <title>Chat - SwiftTalk</title>
      </Helmet>
      <div className="flex h-screen relative">
        {showLogoutConfirmation && (
          <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-sm px-10 py-8">
              <h1 className="text-[#3e6a92] border-b-2 pb-3 mb-3 font-bold text-xl">
                Confirm Logout
              </h1>
              <p className="text-[#3e6a92] mb-10">
                Are you sure you want to logout?
              </p>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  className="text-white font-semibold bg-red-600 rounded-2xl py-1 px-3 mx-3"
                  onClick={handleLogoutConfirmed}
                >
                  Logout
                </button>
                <button
                  type="button"
                  className="border-2 font-semibold border-emerald-600 text-emerald-600 rounded-2xl py-1 px-3 mx-3"
                  onClick={handleLogoutCancelled}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <Sidebar
          onlinePeople={onlinePeople}
          setSelectedUserId={setSelectedUserId}
          selectedUserId={selectedUserId}
          setShowLogoutConfirmation={setShowLogoutConfirmation}
          setSelectedUsername={setSelectedUserUsername}
          setIsLoading={setIsLoading}
        />
        <div className="flex flex-col bg-[#ffff] w-2/3 pb-3 border-l-4 relative">
          {isLoading && (
            <div className="absolute z-20  bg-gray-600 bg-opacity-50 w-full h-full flex items-center justify-center">
              <Loader />
            </div>
          )}
          {selectedUsername && (
            <div className="bg-gray-100 w-full p-4 ps-6">
              <span className="text-xl text-[28425a]">{selectedUsername}</span>
            </div>
          )}

          <div className="flex-grow no-scrollbar overflow-y-auto pb-4 px-16">
            {!selectedUserId && (
              <div className="h-full flex items-center justify-center">
                <div className="text-gray-400">
                  &larr; Select a person from sidebar
                </div>
              </div>
            )}
            {!!selectedUserId && (
              <div className="">
                {messagesWithoutDupes.map((message) => (
                  <div key={message._id} className={message.sender === id ? "text-right " : "text-left"} >
                    <div
                      className={
                        "text-left inline-block p-2 m-2 rounded-sm px-3 " +
                        (message.sender === id
                          ? "bg-slate-600 text-white rounded-tr-xl"
                          : "bg-green-600 text-white rounded-tl-xl")
                      }
                    >
                      {message.text}
                      {message.file && (
                        <div className="">
                          <a
                            target="_blank"
                            className="flex items-center gap-1 border-b"
                            href={axios.defaults.baseURL +"/uploads/" +message.file}
                            rel="noreferrer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" >
                              <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd"/>
                            </svg>
                            {message.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={divUnderMessages}></div>
          </div>

          {!!selectedUserId && (
            <ChatInputBar
              ws={ws}
              selectedUserId={selectedUserId}
              setMessages={setMessages}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Chat;
