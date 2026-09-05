import { useEffect, useState, useCallback } from 'react';
import { getDatabase, ref, onValue, set, remove, onDisconnect, get } from 'firebase/database';
import { app } from '../services/firebase';

export interface RoomMemberModel {
  uid: string;
  displayName: string;
  joinedAt: number;
}

export const useRoomPresence = (roomId: string, userId?: string, userName?: string) => {
  const [members, setMembers] = useState<RoomMemberModel[]>([]);
  const [roomExists, setRoomExists] = useState<boolean>(true);

  useEffect(() => {
    if (!roomId || !userId) return;

    const db = getDatabase(app);
    const roomRef = ref(db, `rooms/${roomId}`);
    const membersRef = ref(db, `rooms/${roomId}/members`);
    const userMemberRef = ref(db, `rooms/${roomId}/members/${userId}`);

    // Check if room exists in RTDB first
    get(roomRef).then((snapshot) => {
      if (!snapshot.exists()) {
        setRoomExists(false);
      }
    });

    // Add current user to members list
    const memberData: RoomMemberModel = {
      uid: userId,
      displayName: userName || 'Guest',
      joinedAt: Date.now(),
    };

    set(userMemberRef, memberData).catch((err) =>
      console.error('Failed to set room member presence:', err)
    );

    // Set up disconnect cleanup on Firebase server
    onDisconnect(userMemberRef)
      .remove()
      .catch((err) => console.error('Failed to attach onDisconnect handler:', err));

    // Listen to real-time members list changes
    const unsubscribe = onValue(membersRef, (snapshot) => {
      if (!snapshot.exists()) {
        setMembers([]);
        return;
      }

      const val = snapshot.val();
      if (val && typeof val === 'object') {
        const memberList: RoomMemberModel[] = Object.values(val);
        setMembers(memberList);
        setRoomExists(true);
      } else {
        setMembers([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, userId, userName]);

  // Function to explicitly leave room and clean up room if last member
  const leaveRoom = useCallback(async () => {
    if (!roomId || !userId) return;

    const db = getDatabase(app);
    const userMemberRef = ref(db, `rooms/${roomId}/members/${userId}`);
    const membersRef = ref(db, `rooms/${roomId}/members`);
    const roomRef = ref(db, `rooms/${roomId}`);

    try {
      // Remove self from members
      await remove(userMemberRef);

      // Check remaining members
      const snapshot = await get(membersRef);
      if (!snapshot.exists() || Object.keys(snapshot.val() || {}).length === 0) {
        // Last member left — delete the entire room node from Realtime Database!
        console.log(`Last member left room ${roomId}. Deleting room from RTDB.`);
        await remove(roomRef);
      }
    } catch (err) {
      console.error('Error leaving room or cleaning up:', err);
    }
  }, [roomId, userId]);

  return { members, roomExists, leaveRoom };
};
