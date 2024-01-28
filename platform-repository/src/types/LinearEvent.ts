/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LinearEvent {
  action: "create" | "update" | "remove";
  type: "Issue" | "Comment" | "Label";
  createdAt: string;
  webhookTimestamp: number;
  webhookId: string;
  data: any;
  url: string;
  updateFrom?: any;
}
