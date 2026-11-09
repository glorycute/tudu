export type CategoryColor =
  | "gray"
  | "blue"
  | "green"
  | "pink"
  | "orange"
  | "purple"
  | "red"
  | "yellow";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string;
  week_starts_on: 0 | 1;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  color: CategoryColor;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  /** ISO date (YYYY-MM-DD). null means the task is in the Inbox. */
  scheduled_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  /** Position in the list; lower comes first. */
  sort_order: number;
};
