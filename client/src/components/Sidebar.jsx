import Contact from "./Contact";
import Logo from "./Logo";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";

const Sidebar = ({ onlinePeople, setSelectedUserId, selectedUserId,  setShowLogoutConfirmation, setSelectedUsername, setIsLoading }) => {
  const [offlinePeople, setOfflinePeople] = useState({});
  const { id } = useContext(UserContext);
  const onlinePeopleExclOurUser = { ...onlinePeople };

  useEffect(() => {
    axios.get("/people").then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);

  // Deletes the user with the specified ID from the `onlinePeople` object.
  delete onlinePeopleExclOurUser[id];

  return (
    <div className="bg-white w-1/3 flex flex-col">
      <div className="flex-grow overflow-auto ">
        <Logo setShowLogoutConfirmation={setShowLogoutConfirmation} />
        <div className="p-2">
          {Object.keys(onlinePeopleExclOurUser).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              username={onlinePeopleExclOurUser[userId]}
              onClick={() => {
                setSelectedUserId(userId);
                setSelectedUsername(onlinePeopleExclOurUser[userId]);
              }}
              selected={userId === selectedUserId}
              online={true}
              setIsLoading={setIsLoading}
            />
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              username={offlinePeople[userId].username}
              onClick={() => {
                setSelectedUserId(userId);
                setSelectedUsername(offlinePeople[userId].username);
              }}
              selected={userId === selectedUserId}
              online={false}
              setIsLoading={setIsLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
