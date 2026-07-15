"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { useAuth, Car } from "@/context/auth";

function readFile(file: File): Promise<string> {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target?.result as string);
    r.readAsDataURL(file);
  });
}

function CarCard({
  car, onUpdate, onRemove,
}: {
  car: Car;
  onUpdate: (patch: Partial<Omit<Car, "id">>) => void;
  onRemove: () => void;
}) {
  const photoRef = useRef<HTMLInputElement>(null);

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onUpdate({ photo: await readFile(file) });
  }

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
      {/* Car photo */}
      <div
        className="h-36 flex items-center justify-center cursor-pointer relative"
        style={{ background: car.photo ? "transparent" : "linear-gradient(135deg,#e2e8f0,#94a3b8)" }}
        onClick={() => photoRef.current?.click()}
      >
        {car.photo
          ? <img src={car.photo} alt="car" className="w-full h-full object-cover" />
          : <span style={{ fontSize: "56px" }}>🚗</span>
        }
        <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center">
          <Icon name="camera-outline" style={{ fontSize: "16px", color: "#4338CA" }} />
        </div>
        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
      </div>

      {/* Fields */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Car model</p>
          <input
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400"
            value={car.name}
            onChange={e => onUpdate({ name: e.target.value })}
            placeholder="e.g. Toyota Camry 2021"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Year</p>
            <input
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400"
              value={car.year}
              onChange={e => onUpdate({ year: e.target.value })}
              placeholder="2021"
            />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Color</p>
            <input
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400"
              value={car.color}
              onChange={e => onUpdate({ color: e.target.value })}
              placeholder="Silver"
            />
          </div>
        </div>
        <button
          onClick={onRemove}
          className="w-full text-xs text-red-400 font-semibold py-2 hover:text-red-600 transition-colors flex items-center justify-center gap-1"
        >
          <Icon name="trash-outline" style={{ fontSize: "13px" }} />
          Remove car
        </button>
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateProfile, addCar, updateCar, removeCar } = useAuth();
  const avatarRef = useRef<HTMLInputElement>(null);

  const [name, setName]   = useState(user?.name  || "");
  const [bio,  setBio]    = useState(user?.bio   || "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);

  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  async function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAvatar(await readFile(file));
  }

  function save() {
    updateProfile({ name, bio, avatar });
    router.back();
  }

  return (
    <div className="min-h-screen bg-[#F5F5FF]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-700 transition-colors">
            <Icon name="arrow-back-outline" style={{ fontSize: "22px" }} />
          </button>
          <h1 className="text-base font-bold text-slate-900 flex-1">Edit profile</h1>
          <button
            onClick={save}
            className="bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-indigo-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-4">

        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full bg-indigo-700 flex items-center justify-center text-white text-3xl font-bold cursor-pointer overflow-hidden shadow-md"
              onClick={() => avatarRef.current?.click()}
            >
              {avatar
                ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                : initials
              }
            </div>
            <button
              onClick={() => avatarRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-indigo-100 shadow flex items-center justify-center"
            >
              <Icon name="camera-outline" style={{ fontSize: "15px", color: "#4338CA" }} />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
          </div>
          <p className="text-xs text-slate-400">Tap photo to change</p>
        </div>

        {/* Name + bio */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Name</p>
            <input
              className="w-full text-sm font-medium text-slate-900 outline-none bg-transparent"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Bio</p>
            <textarea
              className="w-full text-sm text-slate-900 outline-none bg-transparent resize-none"
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell passengers a little about yourself…"
              maxLength={200}
            />
            <p className="text-[10px] text-slate-300 text-right">{bio.length}/200</p>
          </div>
        </div>

        {/* Cars */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">My cars</p>
          <div className="space-y-3">
            {(user?.cars || []).map(car => (
              <CarCard
                key={car.id}
                car={car}
                onUpdate={patch => updateCar(car.id, patch)}
                onRemove={() => removeCar(car.id)}
              />
            ))}
          </div>
          <button
            onClick={() => addCar({ name: "", year: "", color: "", photo: null })}
            className="w-full mt-3 border-2 border-dashed border-slate-200 rounded-2xl py-4 text-sm font-semibold text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="add-circle-outline" style={{ fontSize: "18px" }} />
            Add a car
          </button>
        </div>
      </div>
    </div>
  );
}
