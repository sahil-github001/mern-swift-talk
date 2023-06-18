import Avatar from "./Avatar";

export default function Contact({ id, username, onClick, selected, online, setIsLoading }) {
  return (
    <div
      onClick={() => {
        setIsLoading(true)
        onClick(id);
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }}
      className={
        "border-b  mb-2 flex items-center  gap-2 cursor-pointer " +
        (selected ? "bg-blue-100 rounded-sm" : "")
      }
    >
     
      <div className="flex gap-2 py-2 pl-4 items-center">
        <Avatar online={online} username={username} userId={id} />
        <h6 className="text-[#28425a] text-lg ">{username}</h6>
      </div>
    </div>
  );
}
