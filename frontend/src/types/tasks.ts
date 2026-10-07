// Only the GET /tasks fields needed for this read-only increment are projected.
// Backend IDs and flags may arrive as JSON numbers or numeric strings.
export type Task = {
  id: number
  name: string
  dueDate: string | null
  categoryId: number | null
  categoryName: string | null
  assignedToUserId: number | null
  assigneeName: string | null
}
