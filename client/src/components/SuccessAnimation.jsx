import "../styles/SuccessAnimation.css";

const SuccessAnimation = () => {
  return (
    <div className="success-animation absolute bg-white w-full h-full p-10">
      <h1 className="text-center text-5xl text-[#4BB543] py-8">
        Registration Success
      </h1>
      <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
        <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
      </svg>
    </div>
  );
};

export default SuccessAnimation;
