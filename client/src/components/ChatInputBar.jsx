import { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";


const ChatInputBar = ({ws, selectedUserId, setMessages }) => {

    const [newMessageText, setNewMessageText] = useState("");
    const { id } = useContext(UserContext);
    
    async function sendMessage(ev, file = null) {
        if (ev) ev.preventDefault();
        await ws.send(
          JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
            file,
          })
        );
        if (file) {
          setTimeout(() => {
            axios.get("/messages/" + selectedUserId).then((res) => {
              setMessages(res.data);
            });
          }, 500);
        } else {
          setNewMessageText("");
          setMessages((prev) => [
            ...prev,
            {
              text: newMessageText,
              sender: id,
              recipient: selectedUserId,
              _id: Date.now(),
            },
          ]);
        }
      }
    
      function sendFile(ev) {
        const reader = new FileReader();
        reader.readAsDataURL(ev.target.files[0]);
        reader.onload = () => {
          sendMessage(null, {
            name: ev.target.files[0].name,
            data: reader.result,
          });
        };
      }
  return (
    <form onSubmit={sendMessage} className="flex gap-2 px-4">
    <input
      value={newMessageText}
      onChange={(ev) => setNewMessageText(ev.target.value)}
      type="text"
      placeholder="type your message"
      className="border bg-gray-200 border-blue-300 p-2 flex-grow rounded-sm outline-none"
    />
    <label className="bg-blue-100 p-2 text-gray-700 rounded-sm cursor-pointer">
      <input type="file" className="hidden" onChange={sendFile} />
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
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    </label>
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
  )
}

export default ChatInputBar