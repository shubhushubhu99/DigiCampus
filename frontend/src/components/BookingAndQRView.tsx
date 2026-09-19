import React, { useState, useEffect } from 'react';
import { Room, Booking } from '../types/campus';
import { api } from '../services/api';
import { 
  Calendar, 
  Clock, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search, 
  ScanLine,
  Users,
  Sparkles
} from 'lucide-react';

interface BookingAndQRViewProps {
  rooms: Room[];
  initialRoomId?: number | null;
}

export const BookingAndQRView: React.FC<BookingAndQRViewProps> = ({
  rooms,
  initialRoomId
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [roomId, setRoomId] = useState<number>(initialRoomId || (rooms[0]?.id ?? 1));
  const [title, setTitle] = useState('');
  const [bookedByName, setBookedByName] = useState('');
  const [bookedByEmail, setBookedByEmail] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');
  const [attendeesCount, setAttendeesCount] = useState(25);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Check-In State
  const [scanToken, setScanToken] = useState('');
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const fetchBookings = async () => {
    try {
      const data = await api.getBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await api.createBooking({
        room_id: Number(roomId),
        title,
        booked_by_name: bookedByName,
        booked_by_email: bookedByEmail,
        booking_date: bookingDate,
        start_time: startTime + ':00',
        end_time: endTime + ':00',
        attendees_count: Number(attendeesCount)
      });
      setShowModal(false);
      setTitle('');
      setBookedByName('');
      setBookedByEmail('');
      await fetchBookings();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit reservation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckIn = async (tokenToUse?: string) => {
    const token = tokenToUse || scanToken;
    if (!token) return;

    setCheckInResult(null);
    try {
      const res = await api.checkInBooking(token);
      setCheckInResult({ success: true, message: res.message });
      setScanToken('');
      await fetchBookings();
      setTimeout(() => setCheckInResult(null), 5000);
    } catch (err: any) {
      setCheckInResult({ success: false, message: err.message || 'Check-in failed' });
    }
  };

  const selectedRoom = rooms.find(r => r.id === Number(roomId));

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick QR Scanner Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Check-In Terminal Simulator (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col justify-between border border-cyan-500/30">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
              <ScanLine className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span>Door Tablet QR Scanner Simulator</span>
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Physical Check-In &amp; Presence Sync
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Simulates attendee scanning their reservation QR token at the room door kiosk. Instantly verifies booking, activates room HVAC &amp; lighting, and bumps real-time telemetry occupancy in MySQL.
            </p>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter or paste QR token (e.g. BOOKING-TOKEN-LAB204-TODAY)"
                  value={scanToken}
                  onChange={(e) => setScanToken(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                onClick={() => handleCheckIn()}
                disabled={!scanToken.trim()}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center space-x-2"
              >
                <QrCode className="h-4 w-4" />
                <span>Simulate Physical Scan &amp; Check In</span>
              </button>
            </div>

            {checkInResult && (
              <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                checkInResult.success 
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}>
                {checkInResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{checkInResult.message}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Tip: Click the <strong className="text-cyan-300">Quick Scan</strong> button beside any booking below to test immediately!
          </div>
        </div>

        {/* Right: Booking Actions & Info (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-cyan-400" />
                  <span>Campus Reservation Schedule</span>
                </h3>
                <p className="text-xs text-slate-400">Manage classroom, lab, and auditorium allocations with collision safety.</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Reserve Room</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div>
                <div className="text-2xl font-black text-white">{bookings.length}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Total Bookings</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">
                  {bookings.filter(b => b.status === 'CHECKED_IN').length}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Checked In</div>
              </div>
              <div>
                <div className="text-2xl font-black text-cyan-400">
                  {bookings.filter(b => b.status === 'CONFIRMED').length}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Upcoming</div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-400">
            Clash detection prevents duplicate reservations for the same time slot and checks room capacities automatically.
          </div>
        </div>

      </div>

      {/* Bookings List Table */}
      <div className="glass-panel rounded-2xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">Active &amp; Upcoming Reservations</h4>
        
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading reservations from MySQL...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">No bookings registered currently.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 bg-slate-900/60">
                <tr>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Event / Purpose</th>
                  <th className="px-4 py-3">Booked By</th>
                  <th className="px-4 py-3">Date &amp; Time</th>
                  <th className="px-4 py-3">Attendees</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">QR Token</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => {
                  const isCheckedIn = b.status === 'CHECKED_IN';
                  return (
                    <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                        {b.room_number}
                        <div className="text-[10px] font-sans font-normal text-slate-400">{b.building_name}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {b.title}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white">{b.booked_by_name}</div>
                        <div className="text-[10px] text-slate-500">{b.booked_by_email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{b.booking_date}</div>
                        <div className="text-[10px] text-slate-400">{b.start_time} - {b.end_time}</div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {b.attendees_count} seats
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isCheckedIn 
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                            : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                        {b.qr_token}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isCheckedIn ? (
                          <button
                            onClick={() => handleCheckIn(b.qr_token)}
                            className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition-colors"
                          >
                            Quick Scan
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">Verified</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-cyan-400" />
              <span>Reserve a Room or Lab</span>
            </h3>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Room / Lab</label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.room_number} - {r.name} (Cap: {r.capacity})
                    </option>
                  ))}
                </select>
                {selectedRoom && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Max capacity: {selectedRoom.capacity} attendees &bull; Building: {selectedRoom.building_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Session / Workshop Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Cloud Workshop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Organizer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Prof. John Doe"
                    value={bookedByName}
                    onChange={(e) => setBookedByName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="john@campus.edu"
                    value={bookedByEmail}
                    onChange={(e) => setBookedByEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Attendees</label>
                <input
                  type="number"
                  min="1"
                  max={selectedRoom?.capacity || 100}
                  value={attendeesCount}
                  onChange={(e) => setAttendeesCount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
                >
                  {submitting ? 'Confirming...' : 'Generate Booking & QR Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
