const Dashboard = () => {
  const userDetails = JSON.parse(localStorage.getItem('user'));
  return (
    <div className="min-h-screen w-full bg-slate-50">
      <nav className="bg-white shadow-md px-4 py-2 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">SquadSwipe</h1>
        <div className="flex gap-3 items-center">
          <div className="text-gray-700 font-medium">
            Welcome, {userDetails?.name}!
          </div>
          <div className="rounded-full shadow-md overflow-hidden w-10 h-10 bg-gray-300 flex items-center justify-center flex-shrink-0">
            <img
              src={userDetails?.profileUrl}
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
