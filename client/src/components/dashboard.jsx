import { useState } from 'react';
import CreateRoomDialog from './createRoomDialog';

const Dashboard = () => {
  const userDetails = JSON.parse(localStorage.getItem('user'));
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const rooms = [
    {
      id: 1,
      title: 'Friday Dinner Picks',
      status: 'Active',
      members: 5,
      updated: '2 mins ago',
    },
    {
      id: 2,
      title: 'Weekend Movie Night',
      status: 'Completed',
      members: 4,
      updated: 'Yesterday',
    },
    {
      id: 3,
      title: 'Trip Spot Selection',
      status: 'Active',
      members: 6,
      updated: '3 days ago',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#f1f5f9_100%)]">
      <nav className="sticky top-0 z-10 backdrop-blur-lg bg-white/70 border-b border-slate-200">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white text-sm font-semibold shadow-md">
              SS
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">SquadSwipe</h1>
              <p className="text-xs text-slate-500">Decide together, faster</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-slate-700 font-medium">
              Welcome, {userDetails?.name}!
            </div>
            <div className="rounded-full shadow-md overflow-hidden w-10 h-10 bg-slate-200 flex items-center justify-center flex-shrink-0 ring-2 ring-white">
              <img
                src={userDetails?.profileUrl}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Your rooms
            </span>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Rooms you created and joined
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Jump back into active rooms or review completed ones.
            </p>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="group relative inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_25px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_16px_35px_rgba(15,23,42,0.45)]"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-white text-base">
              +
            </span>
            <span>Create Room</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map(room => (
            <div
              key={room.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {room.title}
                  </h3>
                  <p className="text-xs text-slate-500">{room.updated}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    room.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {room.status}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                <span>{room.members} members</span>
                <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                  Open room
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateRoomDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={payload => {
          console.log('Create room payload:', payload);
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Dashboard;
