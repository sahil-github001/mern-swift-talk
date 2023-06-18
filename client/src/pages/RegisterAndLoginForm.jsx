import { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { Helmet } from "react-helmet";
import SuccessAnimation from "../components/SuccessAnimation";
import Loader from "../components/Loader";

const RegisterAndLoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [isSucessAnimation, setIsSucessAnimation] = useState(false);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [error, setError] = useState(null);

  // The setUsername property is renamed to setLoggedInUsername using the colon (:) notation.
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  const clearInput = () => {
    setUsername("");
    setPassword("");
    setError(null);
  }

  const formValidate = () => {
    if (!username && !password) {
      setError("Please enter a username and password");
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9_]{4,16}$/; // Regular expression for username validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Regular expression for password validation
    if (!usernameRegex.test(username)) {
      setError("Invalid username. Username should be 4-16 characters long and can only contain letters, numbers, and underscores.");
      return;
    }
    if (!passwordRegex.test(password)) {
      setError("Invalid password. Password should be at least 8 characters long, and include at least one letter and one number.");
      return;
    }
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError(null);
    formValidate();

    const url = isLoginOrRegister === "register" ? "register" : "login";
    setIsTextLoading(true);
    await axios
      .post(`/auth/${url}`, { username, password })
      .then((response) => {
        if(response) {
          if(isLoginOrRegister === "register"){
            setIsSucessAnimation(true);
            setTimeout(() => {
              clearInput();
              setIsSucessAnimation(false);
              handleRegisterAndLoginPage();
            }, 2500);
            
          } 
          if(isLoginOrRegister === "login"){
            const { data } = response;
            setLoggedInUsername(username);
            setId(data.id);
          }
        }
      })
      .catch((error) => {
        if (error.response) {
          const { data } = error.response;
          setError(data.error); // Set the error message from the response data
        } else {
          setError("An error occurred during form submission");
        }
      });
    setIsTextLoading(false);
  };



  const handleRegisterAndLoginPage = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoginOrRegister((prevState) =>
        prevState === "register" ? "login" : "register"
      );
      clearInput();
      setIsLoading(false);
    }, 500);
  };

  return (
    <>
      <Helmet>
        <title>{isLoginOrRegister === "register" ? "Register" : "Login"}</title>
      </Helmet>
      <div className="bg-[#e9eaeb] h-screen flex  items-center justify-center relative">
      {isSucessAnimation && (
       <SuccessAnimation/>
      )}

        {isLoading && (
          <div className="absolute z-10 w-full h-full flex justify-center items-center bg-black-rgba">
          <Loader/>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={
            `bg-[#28425a] w-2/5 flex flex-col gap-3 p-10 rounded-xl transition-all duration-300 ` +
            (isLoginOrRegister === "login" && " bg-slate-800")
          }
        >
          <h1
            className={
              `text-white text-4xl ` +
              (isLoginOrRegister === "login" && "text-3xl")
            }
          >
            {isLoginOrRegister === "register"
              ? " Welcome To SwiftTalk"
              : "Login to SwiftTalk!"}
          </h1>
          <h3 className="text-white">
            {isLoginOrRegister === "register"
              ? "Let's create your account"
              : "Please enter your login credentials below to access your account"}
          </h3>
          <input
            type="text"
            className="rounded-md p-2 outline-none"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="rounded-md p-2 outline-none"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
   
          {error && <div className=" text-red-500 max-w-prose">{error}</div>}
          <button
            type="submit"
            className="bg-blue-700 w-fit mx-auto text-white py-1 px-3 rounded-xl"
          >
            {isLoginOrRegister === "register"
              ? isTextLoading
                ? "Register..."
                : "Register"
              : isTextLoading
              ? "Login..."
              : "Login"}
          </button>
          {isLoginOrRegister === "register" && (
            <div className="text-gray-200 text-center">
              <span>Already a member?</span>
              <button
                type="button"
                className="underline text-cyan-300"
                onClick={handleRegisterAndLoginPage}
              >
                Login
              </button>
            </div>
          )}
          {isLoginOrRegister === "login" && (
            <div className="text-gray-200 text-center">
              <span>dont have an account?</span>
              <button
                type="button"
                className="underline text-cyan-300"
                onClick={handleRegisterAndLoginPage}
              >
                Register
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default RegisterAndLoginForm;
