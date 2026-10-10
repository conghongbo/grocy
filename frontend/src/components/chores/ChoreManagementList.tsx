import type { Chore } from "../../api/chores";
import { buildGrocyUrl } from "../../app/bootstrap";
interface Props { chores: Chore[]; canManage: boolean; saving: boolean; onDelete: (chore: Chore) => void; }
export function ChoreManagementList({ chores, canManage, saving, onDelete }: Props) {
    if (chores.length === 0) return <p>No chores match the current filters.</p>;
    return <div className="react-chore-management-scroll"><table className="react-chore-management-table">
        <thead><tr><th>Name</th><th>Description</th><th>Status</th><th>Schedule</th><th>Actions</th></tr></thead>
        <tbody>{chores.map(chore => <tr key={chore.id}>
            <td>{chore.name}</td><td>{chore.description || "—"}</td>
            <td>{Number(chore.active) === 1 ? "Active" : "Disabled"}</td><td>{chore.period_type}</td>
            <td>{canManage && <><a href={buildGrocyUrl(`/chore/${chore.id}`)}>Edit</a>{" "}
                <button type="button" disabled={saving} onClick={() => onDelete(chore)}>Delete</button></>}</td>
        </tr>)}</tbody>
    </table></div>;
}
