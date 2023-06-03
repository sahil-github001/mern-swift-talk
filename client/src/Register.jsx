import { useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";
import { useContext } from "react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
  // The setUsername property is renamed to setLoggedInUsername using the colon (:) notation.

  const register = async (ev) => {
    ev.preventDefault();
    const { data } = await axios.post("/register", { username, password });
    setLoggedInUsername(username);
    setId(data.id);
     
    /* response look like
    { data: {
    // The data returned from the "/register" endpoint
      },
      status: 200, // The HTTP status code of the response
      statusText: 'OK', // The status message of the response
      headers: {
        // The headers of the response
      },
      config: {
        // The axios request configuration
      },
      // ...
    }
    */
  };
  return (
    <div className="bg-blue-100 h-screen flex items-center">
      <form onSubmit={register} className="w-64 mx-auto mb-12">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="username"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="password"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button className="bg-blue-600 text-white block w-full rounded-sm p-2">
          Register
        </button>
        <div className="text-center mt-2">
          Already a member? <a href="">Login</a>
        </div>
      </form>
    </div>
  );
};

export default Register;
