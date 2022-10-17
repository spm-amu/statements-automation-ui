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
  CALL_USER = "CALL_USER",
  ANSWER_CALL = "ANSWER_CALL",
  SENDING_SIGNAL = "SENDING_SIGNAL",
  USER_JOINED = "USER_JOINED",
  RETURNING_SIGNAL = "RETURNING_SIGNAL",
  RECEIVING_RETURNED_SIGNAL = "RECEIVING_RETURNED_SIGNAL",
  USER_LEFT = "USER_LEFT",
  END_CALL = "END_CALL",
  CALL_ENDED = "CALL_ENDED",
  ALL_USERS = "ALL_USERS",

  PERMISSION = "PERMISSION",
  NO_PERMIT_REQUIRED = "NO_PERMIT_REQUIRED",
  ALLOWED = "ALLOWED",
  DENIED = "DENIED",
  PERMIT = "PERMIT",
  RECEIVING_CALL = "RECEIVING_CALL",
  USERS_ONLINE = "USERS_ONLINE",
  USER_ONLINE = "USER_ONLINE",
  USER_OFFLINE = "USER_OFFLINE",
  REGISTER_ONLINE = "REGISTER_ONLINE",
  PERMIT_STATUS = "PERMIT_STATUS",
  CONNECT_ERROR = "CONNECT_ERROR",
  CONNECT = "CONNECT",
}
