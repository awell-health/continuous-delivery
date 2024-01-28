/* eslint-disable @typescript-eslint/no-explicit-any */
import { firestore } from "firebase-admin";

export enum ActionStatus {
  pending = "pending",
  success = "success",
  failure = "failure",
}

export interface IAction<T = any> {
  name: string;
  status: ActionStatus;
  timestamp: string; // ISO-8601
  data?: T;
  errors?: string[];
  result?: any;
}
export type ActionSnapshot = firestore.DocumentSnapshot<IAction>;

export enum ActionName {
  create_echoes_deployment = "create_echoes_deployment",
  update_echoes_deployment = "update_echoes_deployment",
}

export class Action<T = any> implements IAction<T> {
  name: string;
  status: ActionStatus;
  timestamp: string; // ISO-8601
  data?: T;
  errors?: string[];
  result?: any;
  private constructor({
    name,
    status,
    data,
    errors,
    result,
    timestamp,
  }: IAction<T>) {
    this.name = name;
    this.status = status;
    this.data = data;
    this.errors = errors;
    this.result = result;
    this.timestamp = timestamp;
  }

  static fromSnapshot<T>(snapshot: ActionSnapshot): Action<T> {
    const d = snapshot.data();
    if (d === undefined) {
      throw new Error("Action data is undefined");
    }
    return new Action<T>(d);
  }

  static fromName<T>(name: ActionName) {
    return new Action<T>({
      name,
      status: ActionStatus.pending,
      timestamp: new Date().toISOString(),
    });
  }

  public toObj(): IAction<T> {
    return {
      name: this.name,
      status: this.status,
      timestamp: this.timestamp,
      ...(this.data !== undefined && { data: this.data }),
      ...(this.errors !== undefined && { errors: this.errors }),
      ...(this.result !== undefined && { result: this.result }),
    };
  }

  public isPending(): boolean {
    return this.status === ActionStatus.pending;
  }

  public success(): { status: ActionStatus.success } {
    return {
      status: ActionStatus.success,
    };
  }

  public failure(errors: string[] = []): {
    status: ActionStatus.failure;
    errors: string[];
  } {
    return {
      status: ActionStatus.failure,
      errors,
    };
  }

  withData<T>(data: T) {
    return new Action<T>({
      ...this,
      data,
    });
  }
}
