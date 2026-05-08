import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, signInWithGoogle } from '../lib/firebase';
import { AlertCircle, Plus, X, CheckCircle2, User, Clock, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TicketSystem({ failedSystems, onAlert }) {
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    domain: 'Energy',
    title: '',
    description: '',
    severity: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);

  useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTickets(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tickets');
    });
    
    return unsubscribe;
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    
    const path = 'tickets';
    try {
      if (editingTicket) {
        await updateDoc(doc(db, path, editingTicket.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        onAlert(`TICKET_UPDATED: Incident record #${editingTicket.id.slice(0,6)} modified.`, 'info');
      } else {
        await addDoc(collection(db, path), {
          ...formData,
          status: 'open',
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          affectedDomains: failedSystems
        });
        const affectedMsg = failedSystems.length > 0 
          ? ` CASCADE_ALERT sent to: ${failedSystems.join(' / ')}.`
          : "";
        onAlert(`TICKET_CREATED: ${formData.domain} domain alert broadcasted.${affectedMsg}`, 'warn');
      }
      handleCloseModal();
    } catch (error) {
      handleFirestoreError(error, editingTicket ? OperationType.UPDATE : OperationType.CREATE, editingTicket ? `${path}/${editingTicket.id}` : path);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      domain: ticket.domain,
      title: ticket.title,
      description: ticket.description || '',
      severity: ticket.severity
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTicket(null);
    setFormData({ domain: 'Energy', title: '', description: '', severity: 'medium' });
  };

  if (!user) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-lg flex flex-col items-center justify-center text-center">
        <User className="w-8 h-8 text-slate-700 mb-2" />
        <p className="text-xs text-slate-500 mb-4 uppercase">Authentication required for ticket authorization</p>
        <button 
          onClick={signInWithGoogle}
          className="bg-cyan-600 hover:bg-cyan-500 text-black text-[10px] font-bold px-4 py-2 rounded transition-colors uppercase tracking-widest"
        >
          Authorize Identity
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[11px] font-mono uppercase text-slate-500 flex items-center gap-2">
          <AlertCircle className="w-3 h-3 text-pink-500" />
          Active Incident Tickets
        </h3>
        <button 
          onClick={() => setShowModal(true)}
          className="p-1 hover:bg-slate-800 rounded text-cyan-400 transition-colors"
          title="Create Ticket"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
        <AnimatePresence initial={false}>
          {tickets.map((ticket) => (
            <motion.div 
              key={ticket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 border border-slate-800 p-3 rounded text-[10px] space-y-2"
            >
              <div className="flex justify-between items-start">
                <span className={`px-1.5 py-0.5 rounded-sm font-bold uppercase ${
                  ticket.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                  ticket.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
                  'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {ticket.severity}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono tracking-tighter">#{ticket.id.slice(0,6)}</span>
                  {ticket.createdBy === user?.uid && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEdit(ticket)}
                        className="text-slate-600 hover:text-cyan-400 transition-colors p-0.5"
                        title="Edit Ticket"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-white font-bold uppercase truncate">{ticket.title}</div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-cyan-400">{ticket.domain}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleTimeString([], { hour12: false }) : 'PENDING'}
                </span>
              </div>
              {ticket.affectedDomains?.length > 0 && (
                <div className="pt-1 border-t border-slate-800/50">
                  <span className="text-[8px] text-slate-500 uppercase block mb-1">Cascade Impact:</span>
                  <div className="flex flex-wrap gap-1">
                    {ticket.affectedDomains.map(d => (
                      <span key={d} className="bg-pink-500/10 text-pink-500 px-1 rounded-sm text-[8px]">{d}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {tickets.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 italic text-[10px]">
            No active incident tickets recorded.
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#0a0c14] border border-slate-800 w-full max-w-md rounded-xl p-8 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white tracking-tight uppercase">
                  {editingTicket ? 'Modify Domain Alert' : 'Raise Domain Alert'}
                </h2>
                <button onClick={handleCloseModal} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">Target Domain</label>
                    <select 
                      value={formData.domain}
                      onChange={(e) => setFormData({...formData, domain: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-cyan-500"
                    >
                      {['Energy', 'Transport', 'Water', 'Comms', 'Emergency', 'Environment'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">Severity</label>
                    <select 
                      value={formData.severity}
                      onChange={(e) => setFormData({...formData, severity: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-cyan-500"
                    >
                      {['low', 'medium', 'high', 'critical'].map(s => (
                        <option key={s} value={s}>{s.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">Incident Title</label>
                  <input 
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Brief description of failure"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">Technical Details</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Full incident report details..."
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-black font-bold py-3 rounded text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-4"
                >
                  {isSubmitting ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Transmitting...' : (editingTicket ? 'Update Record' : 'Broadcast Alert')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
