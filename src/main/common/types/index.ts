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

export enum SystemEventType {

  SECURITY_TOKENS_REFRESHED = "SECURITY_TOKENS_REFRESHED",
  UNAUTHORISED_API_CALL = "UNAUTHORISED_API_CALL",
  API_ERROR = "API_ERROR",
  API_SUCCESS = "API_SUCCESS",
  WHITEBOARD_EVENT_ARRIVED = "WHITEBOARD_EVENT_ARRIVED",
  ACTIVE_CHAT_CHANGED = "ACTIVE_CHAT_CHANGED",
  FIRST_CHAT_ARRIVED = "FIRST_CHAT_ARRIVED",
  SOCKET_CONNECT = "SOCKET_CONNECT",
  CALL_REJECTED = "CALL_REJECTED",
  SOCKET_DISCONNECT = "SOCKET_DISCONNECT",
  PEER_DISCONNECT = "PEER_DISCONNECT",
  AUDIO_VISUAL_SETTINGS_CHANGED = "AUDIO_VISUAL_SETTINGS_CHANGED",
  PARTICIPANT_IN_VIEW = "PARTICIPANT_IN_VIEW",
  PARTICIPANT_OFF_VIEW = "PARTICIPANT_OFF_VIEW",
  CONSUMER_TRANSPORT_FAILED = "CONSUMER_TRANSPORT_FAILED"

}

export enum MessageType {
  GET_LOBBY = "GET_LOBBY",
  JOIN_MEETING = "JOIN_MEETING",
  CALL_USER = "CALL_USER",
  CALL_MULTIPLE_USER = "CALL_MULTIPLE_USER",
  ANSWER_CALL = "ANSWER_CALL",
  SENDING_SIGNAL = "SENDING_SIGNAL",
  USER_JOINED = "USER_JOINED",
  RETURNING_SIGNAL = "RETURNING_SIGNAL",
  RECEIVING_RETURNED_SIGNAL = "RECEIVING_RETURNED_SIGNAL",
  USER_LEFT = "USER_LEFT",
  END_MEETING = "END_MEETING",
  END_CALL = "END_CALL",
  CALL_ENDED = "CALL_ENDED",
  ALL_USERS = "ALL_USERS",
  CANCEL_CALL = "CANCEL_CALL",

  PERMISSION = "PERMISSION",
  NO_PERMIT_REQUIRED = "NO_PERMIT_REQUIRED",
  ALLOWED = "ALLOWED",
  SYSTEM_ACTIVITY = "SYSTEM_ACTIVITY",
  SYSTEM_EVENT = "SYSTEM_EVENT",
  DENIED = "DENIED",
  PERMIT = "PERMIT",
  RECEIVING_CALL = "RECEIVING_CALL",
  CALL_REJECTED = "CALL_REJECTED",
  USERS_ONLINE = "USERS_ONLINE",
  USER_ONLINE = "USER_ONLINE",
  USER_OFFLINE = "USER_OFFLINE",
  REGISTER_ONLINE = "REGISTER_ONLINE",
  PERMIT_STATUS = "PERMIT_STATUS",
  CONNECT_ERROR = "CONNECT_ERROR",
  CONNECT = "CONNECT",
  JOIN_CHAT_ROOM = "JOIN_CHAT_ROOM",
  CHAT_MESSAGE = "CHAT_MESSAGE",
  RAISE_HAND = "RAISE_HAND",
  LOWER_HAND = "LOWER_HAND",
  CHANGE_HOST = "CHANGE_HOST",
  TOGGLE_RECORD_MEETING = "TOGGLE_RECORD_MEETING",
  POLL_RECORDING_STATUS = "POLL_RECORDING_STATUS",
  REQUEST_TO_JOIN = "REQUEST_TO_JOIN",
  REQUESTED_TO_JOIN_MEETING = "REQUESTED_TO_JOIN_MEETING",
  AUDIO_VISUAL_SETTINGS_CHANGED = "AUDIO_VISUAL_SETTINGS_CHANGED",
  CREATE_WEBRTC_TRANSPORT = "CREATE_WEBRTC_TRANSPORT",
  CONNECT_TRANSPORT = "CONNECT_TRANSPORT",
  PRODUCER_CLOSED = "PRODUCER_CLOSED",
  NEW_PRODUCERS = "NEW_PRODUCERS",
  PRODUCE = "PRODUCE",
  CONSUME = "CONSUME",
  SYSTEM_ALERT = "SYSTEM_ALERT",
  WHITEBOARD_EVENT = "WHITEBOARD_EVENT",
  WHITEBOARD = "WHITEBOARD",
  MEETING_ENDED = "MEETING_ENDED",
  SAVE_RECORDING = "SAVE_RECORDING",
  STOP_RECORDING = "STOP_RECORDING",
  UPDATE_CALENDAR = "UPDATE_CALENDAR",
  REQUEST_TO_JOIN_MEETING_ANSWERED = "REQUEST_TO_JOIN_MEETING_ANSWERED",
  PEER_DISCONNECT = "PEER_DISCONNECT",
  CONSUMER_CLOSED = "CONSUMER_CLOSED",

}
