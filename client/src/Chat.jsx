import { useContext, useEffect, useState, useRef } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import { uniqBy } from "lodash";
import axios from "axios";
import Contact from "./Contact";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [offlinePeople, setOfflinePeople] = useState({})
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const divUnderMessages = useRef();
  const { username, id } = useContext(UserContext);
  useEffect(() => {
    connectToWs();
  }, []);
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
    /*
    In JavaScript, the Set is a built-in object that allows you to store unique values of any type,
    whether it's primitive values or object references. The Set object stores these values in such
    a way that each value can only occur once within the set.
    */
    // const people = new Set();
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
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  };
  const sendMessage = (ev) => {
    ev.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      })
    );
    /*
    (prev) is the argument to the function. It is the current value of the messages state variable.
    ([...prev, {text: newMessageText, isOur: true}]) is the return value of the function.
    It is a new array that contains the previous messages,
    cas well as a new message with the text newMessageText and the isOur property set to true.
    */
    setMessages((prev) => [
      ...prev,
      {
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
        _id: Date.now(),
      },
    ]);
    setNewMessageText("");
  };

  useEffect(() => {
    /*
    divUnderMessages is a reference to a DOM element, and current is a property or method that retrieves
     the current value of that element
    */
    const div = divUnderMessages.current;
    div.scrollIntoView({ behaviour: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    axios.get("/people").then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== id) // exclude our own user
        .filter((p) => !Object.keys(onlinePeople).includes(p._id)); // exclude online people
      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      })
      setOfflinePeople(offlinePeople);
    })
  }, [onlinePeople]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get("/messages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      })
    }
  }, [selectedUserId]);

  const onlinePeopleExclOurUser = { ...onlinePeople };
  // Deletes the user with the specified ID from the `onlinePeople` object.
  delete onlinePeopleExclOurUser[id];

  /*
  This method accepts iteratee which is invoked for each element in array to generate the criterion by which 
  uniqueness is computed. The order of result values is determined by the order they occur in the array. 
  The iteratee is invoked with one argument:
  */
  const messagesWithoutDupes = uniqBy(messages, "_id");

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 ">
        <Logo />
        {Object.keys(onlinePeopleExclOurUser).map((userId) => (
          <Contact 
            key={userId}
            id={userId} 
            username={onlinePeopleExclOurUser[userId]} 
            onClick={() => setSelectedUserId(userId)}
            selected={userId === selectedUserId}
            online={true}
          />
        ))}
          {Object.keys(offlinePeople).map((userId) => (
          <Contact 
            key={userId}
            id={userId} 
            username={offlinePeople[userId].username} 
            onClick={() => setSelectedUserId(userId)}
            selected={userId === selectedUserId}
            online={false}
          />
        ))}
      </div>
      <div className="flex flex-col bg-blue-200 w-2/3 p-2">
        <div className="flex-grow no-scrollbar overflow-y-auto pb-4">
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
                <div
                  key={message._id}
                  className={message.sender === id ? "text-right" : "text-left"}
                >
                  <div
                    className={
                      "text-left inline-block p-2 m-2 rounded-md  " +
                      (message.sender === id
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-500")
                    }
                  >
                    {message.sender === id ? "Me: " : ""}
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={divUnderMessages}></div>
        </div>

        {!!selectedUserId && (
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              value={newMessageText}
              onChange={(ev) => setNewMessageText(ev.target.value)}
              type="text"
              placeholder="type your message"
              className="bg-white border p-2 flex-grow rounded-sm"
            />
            <button
              type="submit"
              className="bg-blue-500 p-2 text-white rounded-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
