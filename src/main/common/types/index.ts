export type WebRTCUser = {
	id: string;
	email: string;
	stream: MediaStream;
};

export type WebsocketMessage = {
  from?: string;
  type: string;
  sdp?: any;
  candidate?: any;
  room: string;
  usersInTheMeeting?: WebRTCUser[];
};

export enum MessageType {
  JOIN = "JOIN",
  OFFER = "OFFER",
  ICE = "ICE",
  ANSWER = "ANSWER",
  LEAVE = "LEAVE",
  ALL_USERS = "ALL_USERS",
}
