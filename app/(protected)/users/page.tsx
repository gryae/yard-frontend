'use client'

import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import { 
  Plus, 
  Edit3, 
  Power, 
  User, 
  Mail, 
  Shield, 
  X, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  ShieldCheck
} from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const res = await axios.get('/users')
    setUsers(res.data)
    setLoading(false)
  }

  const handleCreate = async () => {
    await axios.post('/users', form)
    setShowCreate(false)
    setForm({ name: '', email: '', password: '', role: 'STAFF' })
    fetchUsers()
  }

  const handleUpdate = async () => {
    await axios.put(`/users/${editingUser.id}`, editingUser)
    setEditingUser(null)
    fetchUsers()
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    if (isActive) {
      await axios.patch(`/users/${id}/deactivate`)
    } else {
      await axios.put(`/users/${id}`, { isActive: true })
    }
    fetchUsers()
  }

  // Helper untuk warna Role
  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'PDI': return 'bg-amber-100 text-amber-700 border-amber-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Syncing users...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            User Management
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <ShieldCheck size={16} className="text-blue-500" />
            Control system access and authorization levels
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          Add New Member
        </button>
      </div>

      {/* USER LIST SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <div
            key={u.id}
            className={`group bg-white rounded-[2rem] p-6 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              u.isActive ? 'border-transparent shadow-sm' : 'border-slate-100 opacity-75'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${u.isActive ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-400'}`}>
                <User size={28} />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingUser(u)}
                  className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => toggleActive(u.id, u.isActive)}
                  className={`p-2 rounded-xl transition-colors ${
                    u.isActive ? 'text-slate-400 hover:bg-red-50 hover:text-red-600' : 'text-green-500 hover:bg-green-50'
                  }`}
                >
                  <Power size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-800 text-lg truncate">{u.name}</h3>
                {!u.isActive && (
                  <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-md uppercase">Disabled</span>
                )}
              </div>
              <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                <Mail size={14} /> {u.email}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className={`text-[11px] font-black px-3 py-1 rounded-lg border tracking-wider uppercase ${getRoleStyle(u.role)}`}>
                {u.role}
              </span>
              <span className="text-[10px] font-bold text-slate-300 italic">ID: {u.id.slice(-4)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <Modal
          title="Create New Account"
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
        >
          <UserForm form={form} setForm={setForm} />
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <Modal
          title="Modify Account"
          onClose={() => setEditingUser(null)}
          onSave={handleUpdate}
        >
          <UserForm form={editingUser} setForm={setEditingUser} isEdit />
        </Modal>
      )}
    </div>
  )
}

/* ===========================
    REUSABLE MODERN MODAL
=========================== */

function Modal({ title, children, onClose, onSave }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-8 py-4">
          {children}
        </div>

        <div className="px-8 pb-8 pt-4 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all"
          >
            Discard
          </button>
          <button
            onClick={onSave}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
          >
            Commit Changes
          </button>
        </div>
      </div>
    </div>
  )
}

/* ===========================
    MODERN USER FORM
=========================== */

function UserForm({ form, setForm, isEdit = false }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
        <div className="relative group">
          <User className="absolute left-4 top-3 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/10 focus:ring-4 focus:ring-blue-600/5 px-4 py-3 pl-12 rounded-2xl outline-none transition-all font-medium"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-3 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input
            placeholder="john@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/10 focus:ring-4 focus:ring-blue-600/5 px-4 py-3 pl-12 rounded-2xl outline-none transition-all font-medium"
          />
        </div>
      </div>

      {!isEdit && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
          <div className="relative group">
            <Shield className="absolute left-4 top-3 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/10 focus:ring-4 focus:ring-blue-600/5 px-4 py-3 pl-12 rounded-2xl outline-none transition-all font-medium"
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Role</label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/10 focus:ring-4 focus:ring-blue-600/5 px-4 py-3 rounded-2xl outline-none transition-all font-bold text-slate-700 appearance-none"
        >
          <option value="ADMIN">ADMINISTRATOR</option>
          <option value="STAFF">GENERAL STAFF</option>
          <option value="PDI">PDI TECHNICIAN</option>
        </select>
      </div>

      {isEdit && (
        <div className="pt-2">
          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer group transition-all active:scale-95">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-6 h-6 rounded-lg border-2 border-slate-300 text-blue-600 focus:ring-blue-600 transition-all cursor-pointer"
              />
            </div>
            <span className="font-bold text-slate-700 text-sm">Account Active</span>
          </label>
        </div>
      )}
    </div>
  )
}