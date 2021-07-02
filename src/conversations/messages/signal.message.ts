import { UserInfo } from '../interfaces/user-info';

export interface SignalMessage {
  event: 'signal';
  data: { sender: UserInfo; signalData: unknown };
}
