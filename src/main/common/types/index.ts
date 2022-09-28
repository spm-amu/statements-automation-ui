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
  JOIN_MEETING = "JOIN_MEETING",
  SENDING_SIGNAL = "SENDING_SIGNAL",
  USER_JOINED = "USER_JOINED",
  RETURNING_SIGNAL = "RETURNING_SIGNAL",
  RECEIVING_RETURNED_SIGNAL = "RECEIVING_RETURNED_SIGNAL",
  LEAVE = "LEAVE",
  ALL_USERS = "ALL_USERS",

  PERMISSION = "PERMISSION",
  NO_PERMIT_REQUIRED = "NO_PERMIT_REQUIRED",
  ALLOWED = "ALLOWED",
  DENIED = "DENIED",
  PERMIT = "PERMIT",
  PERMIT_STATUS = "PERMIT_STATUS",
}
