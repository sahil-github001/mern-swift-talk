export default function Avatar({ userId, username, online }) {
  const colors = [
    "bg-teal-200",
    "bg-red-200",
    "bg-green-200",
    "bg-purple-200",
    "bg-blue-200",
    "bg-yellow-200",
    "bg-orange-200",
    "bg-pink-200",
    "bg-fuchsia-200",
    "bg-rose-200",
  ];

  const userIdBase10 = parseInt(userId.substring(10), 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];
  return (
    <div className={"w-12 h-12 relative rounded-full flex items-center " + color}>
      <div className="text-center text-2xl font-bold w-full opacity-70 capitalize">{username[0]}</div>
      {online && (
        <div
          data-te-toggle="tooltip"
          title="online"
          className="absolute w-3 h-3 bg-green-500 bottom-0 right-0 rounded-full border border-white"
        ></div>
      )}
      {!online && (
        <div
          data-te-toggle="tooltip"
          title="offline"
          className="absolute w-3 h-3 bg-gray-500 bottom-0 right-0 rounded-full border border-white"
        ></div>
      )}
    </div>
  );
}
