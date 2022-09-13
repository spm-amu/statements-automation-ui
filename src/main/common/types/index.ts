export type WebRTCUser = {
  userId: string | null;
	session?: any;
};

export type PeerSignal = {
  userToSignal?: any;
  incomingSignal?: any;
  signal: any;
  callerId: string;

};

export type WebsocketMessage = {
  type: MessageType;
  client: WebRTCUser;
  meetingRoomId: string;
  clientsJoined?: any,
  peerSignal?: PeerSignal;
};

export enum MessageType {
  JOIN = "JOIN",
  SENDING_SIGNAL = "SENDING_SIGNAL",
  USER_JOINED = "USER_JOINED",
  RETURNING_SIGNAL = "RETURNING_SIGNAL",
  RECEIVING_RETURNED_SIGNAL = "RECEIVING_RETURNED_SIGNAL",
  LEAVE = "LEAVE",
  ALL_USERS = "ALL_USERS",
}
