export type ServiceTaskInput = {
  title: string;
  isCompleted: boolean;
  sortOrder: number;
};

export function normalizeServiceTaskInput(input: {
  title?: string;
  isCompleted?: boolean;
  sortOrder?: number;
}): ServiceTaskInput {
  return {
    title: input.title?.trim() ?? "",
    isCompleted: Boolean(input.isCompleted),
    sortOrder: Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : 0,
  };
}
