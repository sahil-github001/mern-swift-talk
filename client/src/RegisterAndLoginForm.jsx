import { useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";
import { useContext } from "react";

const RegisterAndLoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("register");

  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
  // The setUsername property is renamed to setLoggedInUsername using the colon (:) notation.

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const url = isLoginOrRegister === "register" ? "register" : "login";

    const { data } = await axios.post(url, { username, password });
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
      <form onSubmit={handleSubmit} className="w-64 mx-auto mb-12">
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
          {isLoginOrRegister === "register" ? "Register" : "Login"}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === "register" && (
            <div>
              Already a member?
              <button onClick={() => setIsLoginOrRegister("login")}>
                Login
              </button>
            </div>
          )}
          {isLoginOrRegister === "login" && (
            <div>
              dont have an account?
              <button onClick={() => setIsLoginOrRegister("register")}>
                Register
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterAndLoginForm;
